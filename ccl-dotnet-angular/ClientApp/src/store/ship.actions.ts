export class FetchShip {
  static readonly type = '[Ship] Fetch Ship';
}

export class AppendShip {
  static readonly type = '[Ship] Update Ship';
  constructor(public payload: string) {}
}
