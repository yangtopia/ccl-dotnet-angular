import { State, Action, Selector, StateContext, createSelector } from '@ngxs/store';
import { patch, append } from '@ngxs/store/operators';
import * as ShipActions from './ship.actions';

export interface ShipStateModel {
  texts: string[];
}

@State<ShipStateModel>({
  name: 'ship',
  defaults: {
    texts: ['INITIAL']
  }
})
export class ShipState {
  // Lazy Selector
  @Selector()
  static fetchShipLazy(state: ShipStateModel) {
    return (type: string) => {
      return [`${type}/${state.texts}`];
    };
  }

  // Dynamic Selector
  static fetchShipDynamic(type: string) {
    return createSelector([ShipState], (state: ShipStateModel) => {
      return [`${type}/${state.texts}`];
    });
  }

  @Action(ShipActions.AppendShip)
  appendShip(ctx: StateContext<ShipStateModel>, { payload }: ShipActions.AppendShip) {
    ctx.setState(
      patch({
        texts: append([payload])
      })
    );
  }
}
