import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { QuayMooringInfo } from 'src/shared/serverModel.interface';
import * as QuayMooringInfoActions from './quayMooringInfo.actions';

export interface QuayMooringInfoStateModel {
  quayMooringInfos: QuayMooringInfo[];
}

@State<QuayMooringInfoStateModel>({
  name: 'quayMooringInfo',
  defaults: {
    quayMooringInfos: []
  }
})
export class QuayMooringInfoState {
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    private http: HttpClient
  ) {}

  @Selector()
  static quayMooringInfos(state: QuayMooringInfoStateModel) {
    return state.quayMooringInfos;
  }

  @Action(QuayMooringInfoActions.FetchQuayMooringInfos)
  fetchTyphoonInfos(
    ctx: StateContext<QuayMooringInfoStateModel>,
    action: QuayMooringInfoActions.FetchQuayMooringInfos
  ) {
    return this.http
      .get<QuayMooringInfo[]>(
        `${this.baseUrl}api/quayMooringInfo/${action.year_tphn_no}`
      )
      .pipe(
        tap(quayMooringInfos => {
          const state = ctx.getState();
          ctx.patchState({
            quayMooringInfos
          });
        })
      );
  }
}
