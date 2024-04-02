import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { randomInt } from 'node:crypto'
import { PrismaService } from 'src/utils/prisma.service'
import { hashPassword, isPasswordValid } from 'src/utils/security'

import { TokenContent } from './types'
import { UserCreatedEvent } from './events/user-created.event'
import { Prisma } from '@prisma/client'

interface CreateUserParams {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface UpdateUserParams {
  id: string
  firstName: string
  lastName: string
}

interface LoginParams {
  email: string
  password: string
}

interface ConfirmUserParams {
  email: string
  password: string
  confirmationCode: string
}

@Injectable()
export class AuthService {
  constructor(
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateConfirmationCode() {
    let confirmationCode = ''
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    for (let i = 0; i < 16; i++) {
      confirmationCode += possibleChars[randomInt(possibleChars.length)]
    }

    return confirmationCode
  }

  private async checkSignUpDisabled() {
    const signUpDisabledRequested = process.env.SIGN_UP_DISABLED === 'true'

    if (!signUpDisabledRequested) {
      return
    }

    const user = await this.prisma.user.findFirst()
    if (user) {
      throw new BadRequestException('Sign up disabled')
    }
  }

  async createUser({ firstName, lastName, email, password }: CreateUserParams) {
    await this.checkSignUpDisabled()

    const encryptedPassword = await hashPassword(password)

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          confirmationCode: this.generateConfirmationCode(),
          email,
          encryptedPassword,
          providerName: 'email',
          providerId: email,
        },
      })
      this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id))
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException('User already exists')
      }
      throw e
    }
  }

  async updateUser({ id, firstName, lastName }: UpdateUserParams) {
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
      },
    })
  }

  async confirmUser({ email, password, confirmationCode }: ConfirmUserParams) {
    const user = await this.prisma.user.findUnique({
      where: {
        providerName_providerId: {
          providerName: 'email',
          providerId: email,
        },
      },
    })
    if (!user || !user.encryptedPassword) {
      throw new UnauthorizedException('Invalid password')
    }

    const passwordValid = await isPasswordValid(
      password,
      user.encryptedPassword,
    )

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password')
    }

    if (user.confirmedAt) {
      throw new BadRequestException('User already confirmed')
    }

    if (user.confirmationCode !== confirmationCode) {
      throw new UnauthorizedException('Invalid confirmation code')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        confirmedAt: new Date(),
      },
    })
  }

  async login({ email, password }: LoginParams) {
    const user = await this.prisma.user.findUnique({
      where: {
        providerName_providerId: {
          providerName: 'email',
          providerId: email,
        },
      },
    })
    if (!user || !user.encryptedPassword) {
      throw new UnauthorizedException('Invalid password')
    }

    const passwordValid = await isPasswordValid(
      password,
      user.encryptedPassword,
    )

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid password')
    }

    if (!user.confirmedAt) {
      throw new BadRequestException('User not confirmed')
    }

    const tokenContent: TokenContent = {
      userId: user.id,
    }

    return {
      accessToken: this.jwtService.sign(tokenContent),
    }
  }

  // TODO: Add password reset
}
