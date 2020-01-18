import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { fabric } from 'fabric';
import { Canvas, IEvent, IPathOptions } from 'fabric/fabric-impl';
import _find from 'lodash/find';
import _isUndefined from 'lodash/isUndefined';
import _keyBy from 'lodash/keyBy';
import _range from 'lodash/range';
import _countBy from 'lodash/countBy';
import _mapValues from 'lodash/mapValues';
import _groupBy from 'lodash/groupBy';
import _get from 'lodash/get';
import _flatMap from 'lodash/flatMap';
import _flatten from 'lodash/flatten';
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  ReplaySubject,
  Subject
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  filter
} from 'rxjs/operators';
import { QuayMooringInfo } from 'src/shared/serverModel.interface.js';
import {
  Coordinate,
  GroupStyle,
  LandScapeClass,
  Road
} from 'src/shared/shipyard.interface';
import quays from '../../../assets/json/quays.json';

export interface QuayOriginInfo {
  originX: number;
  originY: number;
  width: number;
  height: number;
  degree?: number;
}

export interface QuayInfo {
  quayName: string;
  quayDesc: string;
  origin: QuayOriginInfo;
  sector?: [number, number][];
  isVertical?: boolean;
  isRightSide?: boolean;
  shipOrigins?: {
    originX: number;
    originY: number;
    scaleX: number;
    scaleY: number;
    numX?: number;
    numY?: number;
    numSize?: number;
  }[];
  projNum?: string;
  alongside?: 'Stbd' | 'Port';
  mooringStatus?: 'GREEN' | 'ORANGE' | 'RED';
}

export interface CanvasInput<T> {
  spaces: T;
  style?: GroupStyle;
}

export interface QuayClickEvent {
  quayName: string;
  quayDesc: string;
}

export interface QuayMooringPopupInfo {
  quayName: string;
  quayDesc: string;
  projNum?: string;
  realWindSpeed?: number | string;
  realWindColor?: string;
  maxWindSpeed?: number | string;
  maxWindColor?: string;
  satisfiedWindSpeed?: number | string;
  satisfiedWindColor?: string;
  realMoorDrawing?: string;
  maxMoorDrawing?: string;
  satisfiedMoorDrawing?: string;
}

export interface QuayMooringResult {
  satisfiedCount: number;
  impossibleCount: number;
  editableCount: number;
  total: number;
}

const QUAY_INFOS = quays as QuayInfo[];

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements OnInit {
  @ViewChild('popup', { static: false }) popup: ElementRef<HTMLDivElement>;

  @Input() maxZoomLevel: number;
  @Input() minZoomLevel: number;
  @Input() lotSmalls: CanvasInput<LandScapeClass[]>;
  @Input() lotMiddles: CanvasInput<LandScapeClass[]>;
  @Input() coastLines: CanvasInput<LandScapeClass[]>;
  @Input() coastLinePs: CanvasInput<LandScapeClass[]>;
  @Input() roads: CanvasInput<Road[]>;
  @Input() roadCenterLines: CanvasInput<Road[]>;
  @Input() quayNames: CanvasInput<LandScapeClass[]>;

  @Input() typhoonSpeed: number;
  @Input() quayMooringSchedules$: Observable<QuayMooringInfo[]>;

  MOST_INNER_X = 171659.5794;
  MOST_INNER_Y = 251671.8693;
  MOST_OUTER_X = 175102.6454;
  MOST_OUTER_Y = 256071.2663;

  ratioX = 0.7826222548226548; // y축 대비 x축 비율
  ratioY = 1.2777556398860699; // x축 대비 y축 비율

  fabricCanvas: Canvas;

  currentCenterPointer: fabric.Point;

  zoomButtonClickEvent = new Subject<boolean>();
  panButtonClickEvent = new Subject<boolean>();
  quayClickEvent = new ReplaySubject<QuayClickEvent>();

  selectedQuayInfo: Observable<QuayClickEvent>;
  quayMooringPopupInfo$: Observable<QuayMooringPopupInfo>;
  quayMooringResult$: Observable<QuayMooringResult>;

  ngOnInit() {
    const INITIAL_WIDTH = window.innerWidth;
    const INITIAL_HEIGHT = window.innerHeight;

    function isPointInsideOfRect(point, coordinates) {
      let x = point[0];
      let y = point[1];

      let inside = false;
      for (
        let i = 0, j = coordinates.length - 1;
        i < coordinates.length;
        j = i++
      ) {
        let xi = coordinates[i][0],
          yi = coordinates[i][1];
        let xj = coordinates[j][0],
          yj = coordinates[j][1];

        let intersect =
          yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }

      return inside;
    }

    const getX = (y: string | Number, currentHeight: number) =>
      ((Number(y) - this.MOST_INNER_Y) * currentHeight) /
      (this.MOST_OUTER_Y - this.MOST_INNER_Y);

    const getY = (x: string | Number, currentWidth: number, deltaY: number) =>
      (((Number(x) - this.MOST_INNER_X) * currentWidth) /
        (this.MOST_OUTER_X - this.MOST_INNER_X)) *
      deltaY;

    const getConvertedCoordForPolyline = (
      points: Coordinate[],
      currentWidth: number,
      currentHeight: number
    ) => {
      const deltaY = (this.ratioX * currentHeight) / currentWidth;
      return points.map(coordinate => {
        const { _X, _Y } = coordinate;

        const output = {
          x: getX(_Y, currentHeight),
          y: getY(_X, currentWidth, deltaY)
        };
        return output;
      });
    };

    const windowResizeEvent$ = fromEvent(window, 'resize').pipe(
      map(_ => {
        return [window.innerWidth, window.innerHeight];
      }),
      debounceTime(1500),
      startWith([INITIAL_WIDTH, INITIAL_HEIGHT])
    );

    const isZoomClicked$ = merge(
      this.zoomButtonClickEvent,
      this.panButtonClickEvent
    );

    isZoomClicked$.subscribe(isZoom => {
      const zoom = this.fabricCanvas.getZoom();
      this.fabricCanvas.zoomToPoint(
        this.currentCenterPointer,
        isZoom ? zoom + 0.2 : zoom - 0.2
      );
    });

    const quayMooringResult$ = this.quayMooringSchedules$.pipe(
      map<QuayMooringInfo[], QuayMooringResult>(schedules => {
        if (_isUndefined(schedules)) {
          return {
            satisfiedCount: 0,
            impossibleCount: 0,
            editableCount: 0,
            total: 0
          };
        }
        const satisfiedCount =
          _countBy(schedules, schedule => {
            return schedule.real_wdsp >= this.typhoonSpeed;
          })['true'] || 0;

        const impossibleCount =
          _countBy(schedules, schedule => {
            const { real_wdsp, max_wdsp, sfty_wdsp } = schedule;
            return (
              real_wdsp < this.typhoonSpeed &&
              max_wdsp < this.typhoonSpeed &&
              sfty_wdsp < this.typhoonSpeed
            );
          })['true'] || 0;

        return {
          satisfiedCount: satisfiedCount,
          impossibleCount: impossibleCount,
          editableCount: schedules.length - satisfiedCount - impossibleCount,
          total: schedules.length
        };
      })
    );

    this.quayMooringResult$ = quayMooringResult$;

    combineLatest([windowResizeEvent$, this.quayMooringSchedules$]).subscribe(
      ([[screenWidth, screenHeight], quayMooringSchedules]) => {
        const canvasWidth = screenWidth;
        const canvasHeight = screenHeight;
        const quayMooringDict = _mapValues(
          _keyBy(quayMooringSchedules, 'quay_name'),
          v => {
            const color = (() => {
              if (v.real_wdsp >= this.typhoonSpeed) {
                return 'GREEN';
              } else if (
                v.max_wdsp >= this.typhoonSpeed ||
                v.sfty_wdsp >= this.typhoonSpeed
              ) {
                return 'ORANGE';
              } else if (
                v.real_wdsp < this.typhoonSpeed &&
                v.max_wdsp < this.typhoonSpeed &&
                v.sfty_wdsp < this.typhoonSpeed
              ) {
                return 'RED';
              }
            })();
            const copy = { ...v, mooringStatus: color };
            return copy;
          }
        );

        if (this.fabricCanvas) {
          this.fabricCanvas.dispose();
          this.popup.nativeElement.style.display = 'none';
        }
        this.fabricCanvas = new fabric.Canvas('canvas', {
          selection: false,
          hoverCursor: 'arrow'
        });
        this.fabricCanvas.setWidth(canvasWidth);
        this.fabricCanvas.setHeight(canvasHeight);

        if (_isUndefined(this.currentCenterPointer)) {
          this.currentCenterPointer = new fabric.Point(
            canvasWidth / 2,
            canvasHeight / 2
          );
        }

        this.fabricCanvas.on('mouse:up', (fe: IEvent) => {
          this.currentCenterPointer = fe.pointer;
        });

        this.fabricCanvas.on('mouse:wheel', fe => {
          this.currentCenterPointer = fe.pointer;

          const e = fe.e as WheelEvent;
          const delta = e.deltaY;
          let zoom = this.fabricCanvas.getZoom();
          zoom = zoom + delta / 200;
          if (zoom > this.maxZoomLevel) {
            zoom = this.maxZoomLevel;
          }
          if (zoom < this.minZoomLevel) {
            zoom = this.minZoomLevel;
          }
          this.fabricCanvas.zoomToPoint(
            new fabric.Point(e.offsetX, e.offsetY),
            zoom
          );
          fe.e.preventDefault();
          fe.e.stopPropagation();
        });

        // COASTLINE
        const { spaces: coastLines, style: coastLineStyle } = this.coastLines;
        const coastLinesPolylines = coastLines.map(coastLine => {
          const points = getConvertedCoordForPolyline(
            coastLine.Points.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            selectable: false,
            fill: 'transparent',
            stroke: 'darkgrey'
          });
        });

        // COASTLINE_P
        const {
          spaces: coastLinePs,
          style: coastLinePStyle
        } = this.coastLinePs;
        const coastLinesPolylinePs = coastLinePs.map(coastLineP => {
          const points = getConvertedCoordForPolyline(
            coastLineP.Points.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            selectable: false,
            fill: '#b2cfff',
            stroke: '#b2cfff'
          });
        });

        // LOT_MIDDLE
        const { spaces: lotMiddles, style: lotMiddleStyle } = this.lotMiddles;
        const lotMiddlePolylines = lotMiddles.map(lotMiddle => {
          const points = getConvertedCoordForPolyline(
            lotMiddle.Points.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            selectable: false,
            fill: '#f2fee3',
            stroke: '#cfe2ca'
          });
        });

        // LOT_SMALL
        const { spaces: lotSmalls, style: lotSmallStyle } = this.lotSmalls;
        const lotSmallPolylines = lotSmalls.map(lotSmall => {
          const points = getConvertedCoordForPolyline(
            lotSmall.Points.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            selectable: false,
            fill: '#f2fee3',
            stroke: '#cfe2ca'
          });
        });

        // ROADS
        const { spaces: roads, style: roadStyle } = this.roads;
        const roadPolylines = roads.map(road => {
          const points = getConvertedCoordForPolyline(
            road.Points.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            selectable: false,
            fill: '#fff',
            stroke: 'darkgrey'
          });
        });

        // ROAD CENTERLINES
        const {
          spaces: roadCenterLines,
          style: roadCenterLineStyle
        } = this.roadCenterLines;
        const roadCenterLinePolyLines = roadCenterLines.map(roadCenterLine => {
          const points = getConvertedCoordForPolyline(
            roadCenterLine.CenterPoints.Point,
            canvasWidth,
            canvasHeight
          );
          return new fabric.Polyline(points, {
            fill: 'transparent',
            stroke: 'lightgrey'
          });
        });

        // QUAY NAME SECTORS
        const { spaces: quayNames, style: quayNameStyle } = this.quayNames;
        const quayNameSectorPolyLines = quayNames.map((quayName, idx) => {
          const points = getConvertedCoordForPolyline(
            quayName.Points.Point,
            canvasWidth,
            canvasHeight
          );

          return new fabric.Polyline(points, {
            fill: '#94cae5',
            stroke: '#74bed0'
          });
        });

        // QUAY NAMES TEXTS
        const quayNameTexts = quayNames.map((quayName, idx) => {
          const textPosition = (() => {
            switch (quayName._Name) {
              case 'H1':
              case 'H2':
              case 'H3':
              case 'H4':
                return getConvertedCoordForPolyline(
                  [quayName.Origin],
                  canvasWidth,
                  canvasHeight
                )[0];
              default:
                return getConvertedCoordForPolyline(
                  quayName.Points.Point,
                  canvasWidth,
                  canvasHeight
                )[1];
            }
          })();
          return new fabric.Text(quayName._Name, {
            left: textPosition.x,
            top: textPosition.y,
            angle: 39.5,
            fontSize: 10 * (canvasHeight / 1000),
            fontFamily: 'Arial'
          });
        });

        const quayPositionInfos = QUAY_INFOS.map(info => {
          const mooringInfo = quayMooringDict[info.quayName];
          if (mooringInfo) {
            return {
              ...info,
              projNum: mooringInfo.proj_no,
              alongside: mooringInfo.alsd_dirt,
              mooringStatus: mooringInfo.mooringStatus
            };
          }
          return info;
        });

        const getNewCoordByDegree = ({
          originX,
          originY,
          width,
          height
        }: QuayOriginInfo) => {
          // const radian = (degree * Math.PI) / 180;
          const radian = 0;

          const coords = _range(0, 5).map(idx => {
            switch (idx) {
              case 0:
              case 4:
                return {
                  x: originX,
                  y: originY
                };
              case 1:
                return {
                  x: originX + width,
                  y: originY
                };
              case 2:
                return {
                  x: originX + width,
                  y: originY + height
                };
              case 3:
                return {
                  x: originX,
                  y: originY + height
                };
            }
          });

          const modifiedCoords = coords.map(coord => {
            const { x, y } = coord;
            const newX =
              (x - originX) * Math.cos(radian) -
              (y - originY) * Math.sin(radian) +
              originX;
            const newY =
              (x - originX) * Math.sin(radian) -
              (y - originY) * Math.cos(radian) +
              originY;
            return {
              _X: newX.toString(),
              _Y: newY.toString()
            } as Coordinate;
          });
          return modifiedCoords;
        };

        const pointedQuayPositionInfos = quayPositionInfos.map(info => {
          return {
            ...info,
            points: getConvertedCoordForPolyline(
              getNewCoordByDegree(info.origin),
              canvasWidth,
              canvasHeight
            )
          };
        });

        const quayPositionSectorPolyLines = pointedQuayPositionInfos.map(
          (info, idx) => {
            const polyline = new fabric.Polyline(info.points, {
              fill: 'rgba(90, 142, 162, 0.4)',
              stroke: '#85fff5',
              angle: -50.8 - (!info.origin.degree ? 0 : info.origin.degree)
            });
            return polyline;
          }
        );

        const pathLiteral = `M4205 4823 c-110 -1 -375 -7 -590 -13 -214 -6 -579 -15 -810 -20
            -231 -6 -573 -15 -760 -21 -187 -6 -549 -14 -805 -19 -608 -11 -604 -10 -1038
            -220 l-202 -99 0 -1235 0 -1236 148 -74 c316 -158 469 -212 662 -235 47 -5
            290 -12 540 -16 250 -3 586 -10 745 -15 740 -26 2473 -52 2955 -45 461 7 1272
            31 1545 45 1594 86 2779 249 3765 519 444 122 722 216 1060 361 157 67 233 97
            440 170 403 143 668 266 817 380 138 104 151 159 60 247 -104 101 -430 271
            -762 398 -33 12 -96 37 -140 55 -44 18 -154 61 -245 95 -91 35 -244 96 -340
            135 -202 82 -451 167 -700 238 -1165 334 -2488 509 -4389 582 -345 13 -1302
            30 -1561 27 -107 -1 -285 -3 -395 -4z`;

        const quayPositionShipPolyLines = pointedQuayPositionInfos
          .filter((info, idx) => {
            // console.log(info);
            return quayMooringDict[info.quayName];
            // return info.quayName === 'A32';
            // return true;
          })
          .map((info, idx) => {
            const color = (() => {
              switch (info.mooringStatus) {
                case 'GREEN':
                  return '#32cd32';
                case 'ORANGE':
                  return '#ffa500';
                case 'RED':
                  return '#ff4500';
                default:
                  return 'yellow';
              }
            })();

            const {
              quayName,
              alongside = 'Port',
              projNum = '0000',
              isVertical = false,
              isRightSide = false,
              shipOrigins,
              origin,
              points
            } = info;

            const shipObjects = (() => {
              const addtionalOption = (() => {
                const isAlongsidePort = alongside === 'Port';
                if (!isVertical && !isRightSide) {
                  return {
                    flipX: isAlongsidePort
                  };
                } else if (!isVertical && isRightSide) {
                  return {
                    flipX: !isAlongsidePort
                  };
                } else if (isVertical && !isRightSide) {
                  return {
                    flipX: !isAlongsidePort,
                    angle: 129
                  };
                } else if (isVertical && isRightSide) {
                  return {
                    flipX: isAlongsidePort,
                    angle: 129
                  };
                }
              })();

              return _flatMap(shipOrigins, shipOrigin => {
                const {
                  originX,
                  originY,
                  scaleX,
                  scaleY,
                  numX,
                  numY,
                  numSize
                } = shipOrigin;

                const angle = 39.5 - _get(info.origin, 'degree', 0);

                const pathOption: IPathOptions = {
                  stroke: 'black',
                  strokeWidth: 50,
                  fill: color,
                  left: getX(originY, canvasHeight),
                  top: getY(
                    originX,
                    canvasWidth,
                    (this.ratioX * canvasHeight) / canvasWidth
                  ),
                  scaleX: scaleX * (canvasHeight / 1000),
                  scaleY: scaleY * (canvasHeight / 1000),
                  angle,
                  ...addtionalOption
                };

                const shipShape = new fabric.Path(pathLiteral, pathOption);

                const shipNumber = new fabric.Text(projNum, {
                  left: getX(numY || originY, canvasHeight),
                  top: getY(
                    numX || originX,
                    canvasWidth,
                    (this.ratioX * canvasHeight) / canvasWidth
                  ),
                  angle,
                  fontSize: (numSize || 9) * (canvasHeight / 1000),
                  fontFamily: 'Arial',
                  ...addtionalOption,
                  flipX: false
                });

                return [shipShape, shipNumber];
              });
            })();

            return _flatten(shipObjects);
          });

        const groupOfBackgroundMap = new fabric.Group(
          [
            ...coastLinesPolylinePs,
            ...lotMiddlePolylines,
            ...lotSmallPolylines,
            ...coastLinesPolylines,
            ...roadPolylines,
            ...roadCenterLinePolyLines,
            // ...quayNameSectorPolyLines,
            ...quayPositionSectorPolyLines,
            ..._flatten(quayPositionShipPolyLines),
            ...quayNameTexts
          ],
          {
            selectable: true,
            hasBorders: false,
            hasControls: false,
            angle: -39.5,
          }
        );

        groupOfBackgroundMap.set({
          left: canvasWidth / 8,
          top: canvasHeight / 2
        });
        groupOfBackgroundMap.setCoords();

        this.fabricCanvas.add(groupOfBackgroundMap);

        this.fabricCanvas.on('object:moving', () => {
          this.popup.nativeElement.style.display = 'none';
        });

        this.fabricCanvas.on('mouse:move', opt => {
          const target = opt.target;
          if (target) {
            const { x: localX, y: localY } = target.getLocalPointer(opt.e);

            const clickedQuay = _find(quayPositionInfos, info => {
              if (info.sector) {
                const sector = info.sector;
                return isPointInsideOfRect(
                  [
                    (localX / target.width) * 100,
                    (localY / target.height) * 100
                  ],
                  sector
                );
              }
              return false;
            });

            if (clickedQuay) {
              this.fabricCanvas.setCursor('pointer');
            } else {
              this.fabricCanvas.setCursor('default');
            }
          }
        });

        this.fabricCanvas.on('mouse:down', opt => {
          const target = opt.target;
          if (target) {
            const { x: localX, y: localY } = target.getLocalPointer(opt.e);

            console.log(localX, localY);

            const clickedQuay = _find(quayPositionInfos, info => {
              if (info.sector) {
                const sector = info.sector;
                return isPointInsideOfRect(
                  [
                    (localX / target.width) * 100,
                    (localY / target.height) * 100
                  ],
                  sector
                );
              }
              return false;
            });

            if (clickedQuay && quayMooringDict[clickedQuay.quayName]) {
              this.quayClickEvent.next({
                quayName: clickedQuay.quayName,
                quayDesc: clickedQuay.quayDesc
              });
              this.popup.nativeElement.style.display = 'block';
              this.popup.nativeElement.style.left = `${opt.pointer.x}px`;
              this.popup.nativeElement.style.top = `${opt.pointer.y}px`;
            } else {
              this.popup.nativeElement.style.display = 'none';
            }
          }
        });

        this.fabricCanvas.on('mouse:wheel', opt => {
          this.popup.nativeElement.style.display = 'none';
        });

        const quayMooringPopupInfo$ = this.quayClickEvent.pipe(
          distinctUntilChanged(),
          map(clickedQuay => {
            const { quayName, quayDesc } = clickedQuay;
            if (quayMooringDict[quayName]) {
              const {
                proj_no,
                real_wdsp,
                real_moor_dwg,
                max_wdsp,
                max_moor_dwg,
                sfty_wdsp,
                sfty_moor_dwg
              } = quayMooringDict[clickedQuay.quayName];

              const color = (() => {
                if (real_wdsp >= this.typhoonSpeed) {
                  return '#32cd32';
                } else if (
                  max_wdsp >= this.typhoonSpeed ||
                  sfty_wdsp >= this.typhoonSpeed
                ) {
                  return '#ffa500';
                } else if (
                  real_wdsp < this.typhoonSpeed &&
                  max_wdsp < this.typhoonSpeed &&
                  sfty_wdsp < this.typhoonSpeed
                ) {
                  return '#ff4500';
                }
              })();

              return {
                quayName: quayName,
                quayDesc: quayDesc,
                projNum: proj_no,
                realWindSpeed: real_wdsp || '-',
                realWindColor: !real_wdsp ? '#fff' : color,
                maxWindSpeed: max_wdsp || '-',
                maxWindColor: !max_wdsp ? '#fff' : color,
                satisfiedWindSpeed: sfty_wdsp || '-',
                realMoorDrawing: real_moor_dwg || '-',
                maxMoorDrawing: max_moor_dwg || '-',
                satisfiedMoorDrawing: sfty_moor_dwg || '-'
              };
            } else {
              return {
                quayName: clickedQuay.quayName,
                quayDesc: clickedQuay.quayDesc
              };
            }
          }),
          shareReplay(1)
        );
        this.quayMooringPopupInfo$ = quayMooringPopupInfo$;
      }
    );
  }
}
