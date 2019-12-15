import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { QuayInfo } from 'src/shared/serverModel.interface';
import * as QuayInfoActions from './quayInfo.actions';

export interface QuayInfoStateModel {
  quayInfos: QuayInfo[];
}

@State<QuayInfoStateModel>({
  name: 'quayInfo',
  defaults: {
    quayInfos: []
  }
})
export class QuayInfoState {
  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    private http: HttpClient
  ) {}

  @Selector()
  static quayInfos(state: QuayInfoStateModel) {
    return state.quayInfos;
  }

  @Action(QuayInfoActions.FetchQuayInfos)
  fetchTyphoonInfos(ctx: StateContext<QuayInfoStateModel>) {
    return this.http.get<QuayInfo[]>(`${this.baseUrl}api/quayInfo`).pipe(
      tap(quayInfos => {
        const state = ctx.getState();
        ctx.patchState({
          quayInfos: [...state.quayInfos, ...quayInfos]
        });
      })
    );
  }
}
