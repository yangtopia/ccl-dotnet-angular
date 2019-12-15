import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { TyphoonInfo } from 'src/shared/serverModel.interface';
import * as TyphoonInfoActions from './typhoonInfo.actions';

export interface TyphoonInfoStateModel {
  typhoonInfos: TyphoonInfo[];
}

@State<TyphoonInfoStateModel>({
  name: 'typhoonInfo',
  defaults: {
    typhoonInfos: []
  }
})
export class TyphoonInfoState {
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    private http: HttpClient
  ) {}

  @Selector()
  static typhoonInfos(state: TyphoonInfoStateModel) {
    return state.typhoonInfos;
  }

  @Action(TyphoonInfoActions.FetchTyphoonInfos)
  fetchTyphoonInfos(ctx: StateContext<TyphoonInfoStateModel>) {
    return this.http.get<TyphoonInfo[]>(`${this.baseUrl}api/typhoonInfo`).pipe(
      tap(typhoonInfos => {
        const state = ctx.getState();
        ctx.patchState({
          typhoonInfos: [...state.typhoonInfos, ...typhoonInfos]
        });
      })
    );
  }
}
