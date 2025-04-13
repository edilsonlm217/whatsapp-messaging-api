export interface DomainEvent {
  aggregateId: string;
  type: string;
  payload: any;
  occurredOn: Date;
}
