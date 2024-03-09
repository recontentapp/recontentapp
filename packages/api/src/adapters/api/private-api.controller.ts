import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Paths } from 'src/generated/typeDefinitions'
import { AuthService } from 'src/modules/auth/auth.service'
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard'
import { Public } from 'src/utils/is-public.decorator'
import { PrismaService } from 'src/utils/prisma.service'
import { AuthenticatedRequester, Requester } from 'src/utils/requester'
import {
  ConfirmSignUpDto,
  LoginDto,
  SignUpDto,
  UpdateCurrentUserDto,
} from './dto/authentication.dto'

@Controller('private-api')
@UseGuards(JwtAuthGuard)
export class ApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('/Login')
  @Public()
  async login(
    @Body() { email, password }: LoginDto,
  ): Promise<Paths.LogIn.Responses.$200> {
    const { accessToken } = await this.authService.login({ email, password })
    return { accessToken }
  }

  @Post('/SignUp')
  @Public()
  async signUp(
    @Body() { email, password }: SignUpDto,
  ): Promise<Paths.SignUp.Responses.$201> {
    await this.authService.createUser({
      email,
      password,
      firstName: '',
      lastName: '',
    })
    return {}
  }

  @Post('/ConfirmSignUp')
  @Public()
  async confirmUser(
    @Body() { email, password, confirmationCode }: ConfirmSignUpDto,
  ): Promise<Paths.ConfirmSignUp.Responses.$201> {
    await this.authService.confirmUser({
      email,
      password,
      confirmationCode,
    })
    return {}
  }

  @Get('/GetCurrentUser')
  async getCurrentUser(
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.GetCurrentUser.Responses.$200> {
    if (requester.type !== 'user') {
      throw new BadRequestException('Invalid requester')
    }

    const { id, firstName, lastName } =
      await this.prismaService.user.findUniqueOrThrow({
        where: { id: requester.userId },
      })

    return {
      id,
      firstName,
      lastName,
    }
  }

  @Post('/UpdateCurrentUser')
  async updateCurrentUser(
    @Body() { firstName, lastName }: UpdateCurrentUserDto,
    @AuthenticatedRequester() requester: Requester,
  ): Promise<Paths.UpdateCurrentUser.Responses.$200> {
    if (requester.type !== 'user') {
      throw new BadRequestException('Invalid requester')
    }

    await this.authService.updateUser({
      id: requester.userId,
      firstName,
      lastName,
    })

    const { id } = await this.prismaService.user.findUniqueOrThrow({
      where: { id: requester.userId },
    })

    return {
      id,
      firstName,
      lastName,
    }
  }
}
