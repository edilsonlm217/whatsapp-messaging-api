import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MessageModule } from 'src/core/message/message.module';
import { DashboardController } from './dashboard.controller';
import { SessionModule } from 'src/core/session/session.module';

@Module({
  imports: [MessageModule, SessionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
