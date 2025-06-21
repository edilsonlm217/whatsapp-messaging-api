import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MessageModule } from 'src/core/message/message.module';

@Module({
  imports: [MessageModule],
  controllers: [],
  providers: [DashboardService],
})
export class DashboardModule { }
