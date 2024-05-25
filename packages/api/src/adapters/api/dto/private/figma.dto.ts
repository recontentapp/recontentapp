import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ID_LENGTH } from '../constants'

export class DeleteFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  figmaFileId: string
}
