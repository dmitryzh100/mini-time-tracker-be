import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Project } from '@prisma/client';
import { HttpStatusCode } from '@common/constants';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Returns all projects',
  })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: HttpStatusCode.OK,
    description: 'Returns the project',
  })
  @ApiResponse({
    status: HttpStatusCode.NOT_FOUND,
    description: 'Project not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Project | null> {
    return this.projectsService.findOne(id);
  }
}
