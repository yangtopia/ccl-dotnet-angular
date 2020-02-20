import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import _get from 'lodash/get';
import _groupBy from 'lodash/groupBy';
import _has from 'lodash/has';
import _head from 'lodash/head';
import _isEmpty from 'lodash/isEmpty';
import _keys from 'lodash/keys';
import _mapKeys from 'lodash/mapKeys';
import _mapValues from 'lodash/mapValues';
import _uniq from 'lodash/uniq';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
  filter,
  map,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
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

  MAX_ZOOM_LEVEL = 2.4;
  MIN_ZOOM_LEVEL = 1.2;

  typhoonSpeed$: Observable<number>;
  yearOptions$: Observable<string[]>;
  typhoonOptions$: Observable<string[]>;
  schedulesOptions$: Observable<string[]>;
  quayMooringSchedules$: Observable<QuayMooringInfo[]>;

  yearChangeEvent = new Subject<string>();
  typhoonChangeEvent = new Subject<string>();
  scheduleChangeEvent = new Subject<string>();

  lotSmalls: CanvasInput<LandScapeClass[]>;
  lotMiddles: CanvasInput<LandScapeClass[]>;
  coastLines: CanvasInput<LandScapeClass[]>;
  coastLinePs: CanvasInput<LandScapeClass[]>;
  roads: CanvasInput<Road[]>;
  roadCenterLines: CanvasInput<Road[]>;
  quayNames: CanvasInput<LandScapeClass[]>;

  constructor(private store: Store) {
    this.store.dispatch(new TyphoonInfoActions.FetchTyphoonInfos());
    this.store.dispatch(new QuayInfoActions.FetchQuayInfos());

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
  }

  ngOnInit() {
    const yearOptions$ = this.typhoonInfos$.pipe(
      map(infos => _uniq(infos.map(info => info.year)))
    );

    const currentSelectedYearOption$ = yearOptions$.pipe(
      switchMap(yearOptions => {
        const initialYear = _head(yearOptions);
        return this.yearChangeEvent.pipe(startWith(initialYear));
      }),
      filter(opt => !_isEmpty(opt))
    );

    const yearGroupedTyphoonInfos$ = this.typhoonInfos$.pipe(
      map(infos => _groupBy(infos, 'year'))
    );

    const typhoonInfosBySelectedYear$ = currentSelectedYearOption$.pipe(
      withLatestFrom(yearGroupedTyphoonInfos$),
      map(([currentYear, groupedTyphoonInfos]) => {
        return _get(groupedTyphoonInfos, currentYear, [] as TyphoonInfo[]);
      })
    );

    const typhoonScheduleOptionDict$ = typhoonInfosBySelectedYear$.pipe(
      map(infos => {
        const groupedTyphoonInfos = _groupBy(infos, info => {
          return `${info.tphn_no.split('_')[0]}호_${info.tphn_name}`;
        });
        return _mapValues(groupedTyphoonInfos, infos => {
          return _mapKeys(infos, info => {
            const month = info.mnth_date.substr(0, 2);
            const date = info.mnth_date.substr(2, 2);
            const [_, revisionNumber] = info.tphn_no.split('_');
            return `${month}-${date}-R${revisionNumber}`;
          });
        });
      })
    );

    const typhoonOptions$ = typhoonScheduleOptionDict$.pipe(
      map(dict => _keys(dict))
    );

    const currentSelectedTyphoonOption$ = typhoonOptions$.pipe(
      switchMap(typhoonOptions => {
        const initialTyphoon = _head(typhoonOptions);
        return this.typhoonChangeEvent.pipe(startWith(initialTyphoon));
      }),
      filter(opt => !_isEmpty(opt))
    );

    const scheduleOptions$ = currentSelectedTyphoonOption$.pipe(
      withLatestFrom(typhoonScheduleOptionDict$),
      map(([currentSelectedTyphoon, dict]) => {
        return _keys(dict[currentSelectedTyphoon]);
      }),
      startWith([])
    );

    const currentSelectedScheduleOption$ = scheduleOptions$.pipe(
      switchMap(scheduleOptions => {
        const initial = _head(scheduleOptions);
        return this.scheduleChangeEvent.pipe(startWith(initial));
      })
    );

    const currentSelectedTyphoonSchedule$ = combineLatest(
      currentSelectedTyphoonOption$,
      currentSelectedScheduleOption$
    ).pipe(
      withLatestFrom(typhoonScheduleOptionDict$),
      map(([[typhoon, schedule], dict]) => {
        return dict[typhoon][schedule];
      }),
      filter(selecteTyphoonSchedule => !_isEmpty(selecteTyphoonSchedule))
    );

    const typhoonSpeed$ = currentSelectedTyphoonSchedule$.pipe(
      map(opt => opt.tphn_spd)
    );

    const quayMooringInfoParam$ = currentSelectedTyphoonSchedule$.pipe(
      map(selectedTyphoonOption => {
        return `${selectedTyphoonOption.year}_${selectedTyphoonOption.tphn_no}`;
      })
    );

    quayMooringInfoParam$.subscribe(param => {
      this.store.dispatch(
        new QuayMooringInfoActions.FetchQuayMooringInfos(param)
      );
    });

    this.typhoonSpeed$ = typhoonSpeed$;
    this.yearOptions$ = yearOptions$;
    this.typhoonOptions$ = typhoonOptions$;
    this.schedulesOptions$ = scheduleOptions$;
  }
}
