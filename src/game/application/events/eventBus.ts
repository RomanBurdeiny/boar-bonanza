type Handler<T> = (payload: T) => void;

export class EventBus {
  private readonly subs = new Map<string, Set<Handler<unknown>>>();

  on<T>(event: string, handler: Handler<T>): () => void {
    let set = this.subs.get(event);
    if (!set) {
      set = new Set();
      this.subs.set(event, set);
    }
    set.add(handler as Handler<unknown>);
    return (): void => {
      set?.delete(handler as Handler<unknown>);
    };
  }

  emit<T>(event: string, payload: T): void {
    const set = this.subs.get(event);
    if (!set) {
      return;
    }
    for (const h of set) {
      h(payload);
    }
  }
}
