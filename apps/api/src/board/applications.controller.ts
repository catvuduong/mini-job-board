import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { parseId } from './validation.js';

@Controller()
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post('jobs/:id/applications')
  apply(@Param('id') id: string, @Body() body: unknown) {
    return this.applications.apply(parseId(id), body);
  }

  @Get('applications')
  list(@Query('stage') stage?: string) {
    return this.applications.listApplications(stage);
  }

  @Patch('applications/:id/stage')
  moveStage(@Param('id') id: string, @Body() body: unknown) {
    return this.applications.moveStage(id, body);
  }
}
