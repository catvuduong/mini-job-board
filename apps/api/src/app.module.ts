import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbService } from './db.service.js';
import { ApplicationsController } from './board/applications.controller.js';
import { ApplicationsService } from './board/applications.service.js';
import { JobsController } from './board/jobs.controller.js';
import { JobsService } from './board/jobs.service.js';
import { SeedService } from './board/seed.service.js';
import { StatsController } from './board/stats.controller.js';
import { StatsService } from './board/stats.service.js';

@Module({
  imports: [],
  controllers: [AppController, JobsController, ApplicationsController, StatsController],
  providers: [AppService, DbService, JobsService, ApplicationsService, StatsService, SeedService],
})
export class AppModule {}
