export class StateMachine<S, T> {
  table: Map<T, Map<S, S>>;

  constructor(entries: Array<[T, Array<[S, S]>]>) {
    this.table = new Map(
      entries.map(([transition, possibleStates]) => [
        transition,
        new Map(possibleStates),
      ]),
    );
  }

  getNextState(state: S, transition: T): S | null {
    return this.table.get(transition)?.get(state) || null;
  }

  getPossibleStates(transition: T): Array<[S, S]> {
    return [...(this.table.get(transition) || new Map()).entries()];
  }
}
