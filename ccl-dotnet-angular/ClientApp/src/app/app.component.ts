import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import _groupBy from 'lodash/groupBy';
import _has from 'lodash/has';
import _head from 'lodash/head';
import { merge, Observable, Subject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import { QuayInfoState } from 'src/store/quayInfo.state';
import shipyard from '../assets/json/shipyard.json';
import {
  QuayInfo,
  QuayMooringInfo,
  TyphoonInfo
} from '../shared/serverModel.interface';
import {
  AreaGroup,
  LandScapeClass,
  Road,
  RoadGroup,
  ShipyardXML
} from '../shared/shipyard.interface';
import * as QuayInfoActions from '../store/quayInfo.actions';
import * as QuayMooringInfoActions from '../store/quayMooringInfo.actions';
import { QuayMooringInfoState } from '../store/quayMooringInfo.state';
import * as TyphoonInfoActions from '../store/typhoonInfo.actions';
import { TyphoonInfoState } from '../store/typhoonInfo.state';
import { CanvasInput } from './components/canvas/canvas.component';

const SHIPYARD_XML = shipyard as ShipyardXML;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Select(TyphoonInfoState.typhoonInfos)
  typhoonInfos$: Observable<TyphoonInfo[]>;
  @Select(QuayInfoState.quayInfos)
  quayInfos$: Observable<QuayInfo[]>;
  @Select(QuayMooringInfoState.quayMooringInfos)
  quayMooringInfos$: Observable<QuayMooringInfo[]>;

  INITIAL_ZOOM_LEVEL = 1;
  MAX_ZOOM_LEVEL = 3;
  MIN_ZOOM_LEVEL = 0.5;
  STEP_OF_ZOOM_LEVEL = 0.5;

  lotSmalls: CanvasInput<LandScapeClass[]>;
  lotMiddles: CanvasInput<LandScapeClass[]>;
  coastLines: CanvasInput<LandScapeClass[]>;
  coastLinePs: CanvasInput<LandScapeClass[]>;
  roads: CanvasInput<Road[]>;
  roadCenterLines: CanvasInput<Road[]>;
  quayNames: CanvasInput<LandScapeClass[]>;

  currentZoomLevel$: Observable<number>;
  zoomButtonClickEvent = new Subject<boolean>();
  panButtonClickEvent = new Subject<boolean>();

  constructor(private store: Store) {
    this.store.dispatch(new TyphoonInfoActions.FetchTyphoonInfos());
    this.store.dispatch(new QuayInfoActions.FetchQuayInfos());
    this.store.dispatch(new QuayMooringInfoActions.FetchQuayMooringInfos());

    const {
      Appearance,
      Spaces: { Space }
    } = SHIPYARD_XML.Shipyard;

    const spaceStyledDict = _groupBy(Appearance.Space.Groups.Group, '_Name');

    const areas = Space.filter(space => _has(space, 'Area')).map(
      space => space.Area
    );
    const groupedArea = _groupBy(areas, '_Group');

    const landScapes = Space.filter(space => _has(space, 'LandScape')).map(
      space => space.LandScape
    );
    const groupedLandScape = _groupBy(landScapes, '_Group');

    const quayNames = Space.filter(space => _has(space, 'QuayName')).map(
      space => space.QuayName
    );
    const groupedQuayNames = _groupBy(quayNames, '_Group');

    const roads = Space.filter(space => _has(space, 'Road')).map(
      space => space.Road
    );
    const groupedRoad = _groupBy(roads, '_Group');

    const LOT_SMALL_ARR = groupedArea[AreaGroup.GIFLotsmall];
    const LOT_MIDDLE_ARR = groupedArea[AreaGroup.GIFLotmiddle];
    const COASTLINE_ARR = groupedLandScape[AreaGroup.GIFCoastline];
    const COASTLINE_P_ARR = groupedLandScape[AreaGroup.GIFCoastlineP];
    const QUAYNAME_ARR = groupedQuayNames[AreaGroup.GIFQuayname];
    const ROAD_ARR = groupedRoad[RoadGroup.GIFRoad];
    const ROAD_CENTER_LINE_ARR = groupedRoad[RoadGroup.GIFRoadcenterline];

    this.lotSmalls = {
      spaces: LOT_SMALL_ARR,
      style: _head(spaceStyledDict[AreaGroup.GIFLotsmall])
    };
    this.lotMiddles = {
      spaces: LOT_MIDDLE_ARR,
      style: _head(spaceStyledDict[AreaGroup.GIFCoastline])
    };
    this.coastLines = {
      spaces: COASTLINE_ARR,
      style: _head(spaceStyledDict[AreaGroup.GIFCoastline])
    };
    this.coastLinePs = {
      spaces: COASTLINE_P_ARR,
      style: _head(spaceStyledDict[AreaGroup.GIFCoastlineP])
    };
    this.roads = {
      spaces: ROAD_ARR,
      style: _head(spaceStyledDict[RoadGroup.GIFRoad])
    };
    this.roadCenterLines = {
      spaces: ROAD_CENTER_LINE_ARR,
      style: _head(spaceStyledDict[RoadGroup.GIFRoadcenterline])
    };
    this.quayNames = {
      spaces: QUAYNAME_ARR,
      style: _head(spaceStyledDict[AreaGroup.GIFQuayname])
    };

    const currentZoomLevel$ = merge(
      this.zoomButtonClickEvent,
      this.panButtonClickEvent
    ).pipe(
      scan((acc: number, isZoom: boolean) => {
        if (isZoom && acc < this.MAX_ZOOM_LEVEL) {
          return acc + this.STEP_OF_ZOOM_LEVEL;
        } else if (!isZoom && acc > this.MIN_ZOOM_LEVEL) {
          return acc - this.STEP_OF_ZOOM_LEVEL;
        } else {
          return acc;
        }
      }, this.INITIAL_ZOOM_LEVEL),
      startWith(this.INITIAL_ZOOM_LEVEL)
    );

    this.currentZoomLevel$ = currentZoomLevel$;
  }

  ngOnInit() {
    this.typhoonInfos$.subscribe(infos => console.log(infos));
    this.quayInfos$.subscribe(infos => console.log(infos));
    this.quayMooringInfos$.subscribe(infos => console.log(infos));
  }
}
