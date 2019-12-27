import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { fabric } from 'fabric';
import { Canvas, IEvent } from 'fabric/fabric-impl';
import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import {
  Coordinate,
  GroupStyle,
  LandScapeClass,
  Road
} from 'src/shared/shipyard.interface';
import _range from 'lodash/range';

export interface QuayOriginInfo {
  originX: number;
  originY: number;
  width: number;
  height: number;
  degree?: number;
}

export interface CanvasInput<T> {
  spaces: T;
  style?: GroupStyle;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CanvasComponent implements OnInit {
  @Input() maxZoomLevel: number;
  @Input() minZoomLevel: number;
  @Input() lotSmalls: CanvasInput<LandScapeClass[]>;
  @Input() lotMiddles: CanvasInput<LandScapeClass[]>;
  @Input() coastLines: CanvasInput<LandScapeClass[]>;
  @Input() coastLinePs: CanvasInput<LandScapeClass[]>;
  @Input() roads: CanvasInput<Road[]>;
  @Input() roadCenterLines: CanvasInput<Road[]>;
  @Input() quayNames: CanvasInput<LandScapeClass[]>;

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

  ngOnInit() {
    const INITIAL_WIDTH = window.innerWidth;
    const INITIAL_HEIGHT = window.innerHeight;

    const getConvertedCoordForPolyline = (
      points: Coordinate[],
      currentWidth: number,
      currentHeight: number
    ) => {
      return points.map(coordinate => {
        const { _X, _Y } = coordinate;
        const deltaY = (this.ratioX * currentHeight) / currentWidth;
        const output = {
          y:
            (((Number(_X) - this.MOST_INNER_X) * currentWidth) /
              (this.MOST_OUTER_X - this.MOST_INNER_X)) *
            deltaY,
          x:
            ((Number(_Y) - this.MOST_INNER_Y) * currentHeight) /
            (this.MOST_OUTER_Y - this.MOST_INNER_Y)
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

    windowResizeEvent$.subscribe(([screenWidth, screenHeight]) => {
      const canvasWidth = screenWidth;
      const canvasHeight = screenHeight;
      if (this.fabricCanvas) {
        this.fabricCanvas.dispose();
      }
      this.fabricCanvas = new fabric.Canvas('canvas');
      this.fabricCanvas.setWidth(canvasWidth);
      this.fabricCanvas.setHeight(canvasHeight);

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
      const { spaces: coastLinePs, style: coastLinePStyle } = this.coastLinePs;
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
          fontSize: 10,
          fontFamily: 'Arial'
        });
      });

      const quayPositionInfos: {
        quayName: string;
        quayDesc: string;
        origin: QuayOriginInfo;
      }[] = [
        {
          quayName: 'R5W',
          quayDesc: 'RD5서편',
          origin: {
            originX: 172840,
            originY: 254110,
            width: 470,
            height: 80
          }
        },
        {
          quayName: 'R50',
          quayDesc: 'RD5',
          origin: {
            originX: 172900,
            originY: 254060,
            width: 470,
            height: 80
          }
        },
        {
          quayName: 'R5E',
          quayDesc: 'RD5동편',
          origin: {
            originX: 172960,
            originY: 254010,
            width: 470,
            height: 80
          }
        },
        {
          quayName: 'R5N',
          quayDesc: 'RD5북편',
          origin: {
            originX: 173198,
            originY: 254425,
            width: 100,
            height: 80
          }
        },
        {
          quayName: 'S11',
          quayDesc: '특수선 S11',
          origin: {
            originX: 172575,
            originY: 253860,
            width: 20,
            height: 190
          }
        },
        {
          quayName: 'S12',
          quayDesc: '특수선 S12(이중)',
          origin: {
            originX: 172590,
            originY: 253878,
            width: 20,
            height: 190
          }
        },
        {
          quayName: 'S21',
          quayDesc: '특수선 S21',
          origin: {
            originX: 172455,
            originY: 253895,
            width: 130,
            height: 20
          }
        },
        {
          quayName: 'S31',
          quayDesc: '특수선 S31',
          origin: {
            originX: 172415,
            originY: 253905,
            width: 180,
            height: 20
          }
        },
        {
          quayName: 'S32',
          quayDesc: '특수선 S32(이중)',
          origin: {
            originX: 172397,
            originY: 253920,
            width: 180,
            height: 20
          }
        },
        {
          quayName: 'LQE',
          quayDesc: '특수선 L/Q동편',
          origin: {
            originX: 172420,
            originY: 253810,
            width: 120,
            height: 15
          }
        },
        {
          quayName: 'A31',
          quayDesc: 'A3안벽',
          origin: {
            originX: 172605,
            originY: 253770,
            width: 370,
            height: 60
          }
        },
        {
          quayName: 'A32',
          quayDesc: 'A3안벽(이중)',
          origin: {
            originX: 172555,
            originY: 253810,
            width: 370,
            height: 60
          }
        },
        {
          quayName: 'A21',
          quayDesc: 'A2안벽',
          origin: {
            originX: 172645,
            originY: 253670,
            width: 420,
            height: 60
          }
        },
        {
          quayName: 'A22',
          quayDesc: 'A2안벽(이중)',
          origin: {
            originX: 172695,
            originY: 253630,
            width: 420,
            height: 60
          }
        },
        {
          quayName: 'C12',
          quayDesc: 'C안벽(이중)',
          origin: {
            originX: 172760,
            originY: 253610,
            width: 325,
            height: 60
          }
        },
        {
          quayName: 'C11',
          quayDesc: 'C안벽',
          origin: {
            originX: 172810,
            originY: 253570,
            width: 325,
            height: 60
          }
        }
      ];

      const quayPositionSectorPolyLines = quayPositionInfos.map((info, idx) => {
        const getNewCoordByDegree = ({
          originX,
          originY,
          degree = 0,
          width,
          height
        }: QuayOriginInfo) => {
          const radian = (degree * Math.PI) / 180;

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

        const points = getConvertedCoordForPolyline(
          getNewCoordByDegree(info.origin),
          canvasWidth,
          canvasHeight
        );

        return new fabric.Polyline(points, {
          fill: 'rgba(90, 142, 162, 0.4)',
          stroke: '#85fff5',
          angle: -50.8
        });
      });

      this.fabricCanvas.add(
        new fabric.Group(
          [
            ...coastLinesPolylinePs,
            ...lotMiddlePolylines,
            ...lotSmallPolylines,
            ...coastLinesPolylines,
            ...roadPolylines,
            ...roadCenterLinePolyLines,
            // ...quayNameSectorPolyLines,
            ...quayNameTexts,
            ...quayPositionSectorPolyLines
          ],
          {
            selectable: true,
            hasBorders: false,
            hasControls: false,
            angle: -39.5,
            top: canvasHeight * 0.5,
            left: canvasWidth * 0.1
          }
        )
      );
    });
  }
}
