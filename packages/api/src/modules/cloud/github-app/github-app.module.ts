import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { GitHubAppInstallationService } from './installation.service'
import { GitHubAppSyncService } from './sync.service'

@Module({
  providers: [
    PrismaService,
    GitHubAppInstallationService,
    GitHubAppSyncService,
  ],
  exports: [GitHubAppInstallationService, GitHubAppSyncService],
})
export class GitHubAppModule {}
