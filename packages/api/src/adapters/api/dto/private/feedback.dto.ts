import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ID_LENGTH, TEXT_LENGTH } from '../constants'

export class SendFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  message: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  referrer: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(ID_LENGTH)
  workspaceId: string
}
