import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/utils/prisma.service'
import { RequestUser } from 'src/utils/requester'

import { TokenContent } from './types'
import { ConfigService } from '@nestjs/config'
import { Config } from 'src/utils/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService<Config, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('security.jwtSecret', {
        infer: true,
      }),
    })
  }

  async validate(payload: TokenContent): Promise<RequestUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.userId },
      include: {
        accounts: {
          where: {
            blockedAt: null,
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('User does not exist')
    }

    return {
      type: 'human',
      user,
    }
  }
}
