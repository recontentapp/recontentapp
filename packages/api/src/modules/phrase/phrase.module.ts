import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { PhraseService } from './phrase.service'
import { CSVService } from '../io/csv.service'
import { JSONService } from '../io/json.service'
import { YAMLService } from '../io/yaml.service'
import { ExcelService } from '../io/excel.service'

@Module({
  providers: [
    PrismaService,
    PhraseService,
    CSVService,
    JSONService,
    YAMLService,
    ExcelService,
  ],
  exports: [PhraseService],
})
export class PhraseModule {}
