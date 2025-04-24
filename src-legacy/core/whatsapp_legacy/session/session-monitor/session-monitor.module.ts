import { Module } from "@nestjs/common";
import { SessionStateModule } from "../session-state/session-state.module";
import { SessionMonitorService } from "./session-monitor.service";

@Module({
  imports: [SessionStateModule],
  controllers: [],
  providers: [SessionMonitorService],
  exports: [SessionMonitorService]
})
export class SessionMonitorModule { }
