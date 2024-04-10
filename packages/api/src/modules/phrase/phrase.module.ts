import { Module } from '@nestjs/common'
import { PrismaService } from 'src/utils/prisma.service'

import { PhraseService } from './phrase.service'
import { CSVService } from '../io/csv.service'
import { JSONService } from '../io/json.service'
import { YAMLService } from '../io/yaml.service'
import { ExcelService } from '../io/excel.service'
import { DestinationService } from './destination.service'
import { TranslateService } from './translate.service'

@Module({
  providers: [
    PrismaService,
    PhraseService,
    DestinationService,
    TranslateService,
    CSVService,
    JSONService,
    YAMLService,
    ExcelService,
  ],
  exports: [PhraseService, TranslateService, DestinationService],
})
export class PhraseModule {}
