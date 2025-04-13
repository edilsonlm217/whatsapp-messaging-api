export abstract class DomainEvent {
  readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly type: string,
    public readonly payload: Record<string, any>,
  ) {
    this.occurredOn = new Date();
  }
}
