import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';

import { SortOrder } from '@common/enums';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      orderBy: { name: SortOrder.Asc },
    });
  }

  async findOne(id: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }
}
