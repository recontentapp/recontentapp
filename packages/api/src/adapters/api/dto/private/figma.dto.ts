import { IsNotEmpty, IsString } from 'class-validator'

export class DeleteFigmaFileDto {
  @IsString()
  @IsNotEmpty()
  figmaFileId: string
}
