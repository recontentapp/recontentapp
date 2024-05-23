import { IsNotEmpty, IsString } from 'class-validator'

export class SendFeedbackDto {
  @IsString()
  @IsNotEmpty()
  message: string

  @IsString()
  @IsNotEmpty()
  referrer: string

  @IsString()
  @IsNotEmpty()
  workspaceId: string
}
