import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { GetDashboardSnapshotDto } from "src/common/get-dashboard-snapshot.dto";

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  async getDashboardSnapshot(
    @Query() query: GetDashboardSnapshotDto
  ) {
    return this.dashboardService.getSnapshot(query.range, query.sessionId);
  }
}