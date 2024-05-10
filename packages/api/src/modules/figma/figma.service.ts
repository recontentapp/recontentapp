import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'

@Injectable()
export class FigmaService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
  ) {}
}
