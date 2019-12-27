import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { fabric } from 'fabric';
import { Canvas, IEvent, IRectOptions } from 'fabric/fabric-impl';
import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import {
  Coordinate,
  GroupStyle,
  LandScapeClass,
  Road
} from 'src/shared/shipyard.interface';

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

    const getConvertedCoordinate = (
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

    const temp = merge(this.zoomButtonClickEvent, this.panButtonClickEvent);
    temp.subscribe(isZoom => {
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
        const points = getConvertedCoordinate(
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
              return getConvertedCoordinate(
                [quayName.Origin],
                canvasWidth,
                canvasHeight
              )[0];
            default:
              return getConvertedCoordinate(
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
        rectOpt: IRectOptions;
      }[] = [
        {
          quayName: 'R5W',
          quayDesc: 'RD5서편',
          rectOpt: {
            left: 518,
            top: 240,
            width: 100
          }
        },
        {
          quayName: 'R50',
          quayDesc: 'RD5',
          rectOpt: {
            left: 507,
            top: 253,
            width: 100
          }
        },
        {
          quayName: 'R5E',
          quayDesc: 'RD5동편',
          rectOpt: {
            left: 496,
            top: 266,
            width: 100
          }
        },
        {
          quayName: 'R5N',
          quayDesc: 'RD5북편',
          rectOpt: {
            left: 584,
            top: 317,
            width: 15
          }
        },
        {
          quayName: 'A21',
          quayDesc: 'A2안벽',
          rectOpt: {
            left: 422,
            top: 197,
            width: 95,
            height: 13
          }
        },
        {
          quayName: 'A22',
          quayDesc: 'A2안벽(이중)',
          rectOpt: {
            left: 414,
            top: 207,
            width: 95,
            height: 13
          }
        },
        {
          quayName: 'C12',
          quayDesc: 'C안벽(이중)',
          rectOpt: {
            left: 411,
            top: 225,
            width: 70,
            height: 13
          }
        },
        {
          quayName: 'C11',
          quayDesc: 'C안벽',
          rectOpt: {
            left: 403,
            top: 235,
            width: 70,
            height: 13
          }
        }
      ];

      const quaySectors = quayPositionInfos.map(opt => {
        const defaultOption: IRectOptions = {
          fill: 'rgba(90, 142, 162, 0.4)',
          strokeWidth: 1,
          stroke: '#85fff5',
          height: 15,
          angle: 39.5,
          hasControls: true
        };
        const optExtended = { ...defaultOption, ...opt.rectOpt };
        return new fabric.Rect(optExtended);
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
            ...quaySectors
          ],
          {
            selectable: true,
            hasBorders: false,
            hasControls: false,
            angle: -39.5,
            top: canvasHeight * 0.5
          }
        )
      );
    });
  }
}
