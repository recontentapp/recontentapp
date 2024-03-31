import { Module } from '@nestjs/common'
import { CSVService } from './csv.service'
import { JSONService } from './json.service'
import { YAMLService } from './yaml.service'
import { ExcelService } from './excel.service'

@Module({
  providers: [CSVService, JSONService, YAMLService, ExcelService],
  exports: [CSVService, JSONService, YAMLService, ExcelService],
})
export class IOModule {}
