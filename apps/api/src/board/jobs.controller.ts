import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { parseJobFilters, type RawQuery } from './job-filters.js';
import { parseId } from './validation.js';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(@Query() query: RawQuery) {
    return this.jobs.listJobs(parseJobFilters(query));
  }

  // Declared before ':id' so that 'skills' is not parsed as a job id.
  @Get('skills')
  skills() {
    return this.jobs.listSkills();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.jobs.getJob(parseId(id));
  }

  @Post()
  create(@Body() body: unknown) {
    return this.jobs.createJob(body);
  }
}
