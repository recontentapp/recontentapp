import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class UpdateCurrentUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string
}

export class ConfirmSignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsString()
  @IsNotEmpty()
  confirmationCode: string
}

export class ExchangeGoogleCodeForAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  code: string
}
