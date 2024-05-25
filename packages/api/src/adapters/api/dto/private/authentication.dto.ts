import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { TEXT_LENGTH } from '../constants'

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(TEXT_LENGTH)
  password: string
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(TEXT_LENGTH)
  password: string
}

export class UpdateCurrentUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  firstName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  lastName: string
}

export class ConfirmSignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(TEXT_LENGTH)
  password: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  confirmationCode: string
}

export class ExchangeGoogleCodeForAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TEXT_LENGTH)
  code: string
}
