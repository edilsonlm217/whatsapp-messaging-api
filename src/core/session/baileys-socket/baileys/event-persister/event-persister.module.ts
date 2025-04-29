import { Module } from '@nestjs/common';
import { EventStoreModule } from './event-store/event-store.module';
import { EventPersisterService } from './event-persister.service';


@Module({
    imports: [EventStoreModule],
    controllers: [],
    providers: [EventPersisterService],
    exports: [EventPersisterService]
})
export class EventPersisterModule { }
