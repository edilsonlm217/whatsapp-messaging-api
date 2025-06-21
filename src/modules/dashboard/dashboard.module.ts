import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MessageModule } from 'src/core/message/message.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [MessageModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
