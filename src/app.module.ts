import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@config/config.module';
import { PrismaModule } from '@database/prisma/prisma.module';
import { AuthModule } from '@modules/auth/auth.module';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { LeavesModule } from '@modules/leaves/leaves.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { TimeEntriesModule } from '@modules/time-entries/time-entries.module';
import { UsersModule } from '@modules/users/users.module';
import { MailModule } from './services/mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TimeEntriesModule,
    LeavesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
