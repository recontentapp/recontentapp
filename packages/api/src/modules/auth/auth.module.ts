import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from 'src/utils/prisma.service'

import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { PermissionService } from './permission.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, PermissionService],
  exports: [AuthService, PermissionService],
})
export class AuthModule {}
