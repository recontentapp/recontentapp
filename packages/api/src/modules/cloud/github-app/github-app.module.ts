import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { GitHubAppInstallationService } from './installation.service'

@Module({
  providers: [PrismaService, GitHubAppInstallationService],
  exports: [GitHubAppInstallationService],
})
export class GitHubAppModule {}
