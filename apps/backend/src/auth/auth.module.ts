import { Logger, Module, Type } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DevAuthController } from './dev-auth.controller';
import { SupabaseStrategy } from './supabase.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

const isDevAuthEnabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.DEV_AUTH_ENABLED === 'true';

const controllers: Type[] = [AuthController];
if (isDevAuthEnabled) {
  controllers.push(DevAuthController);
  Logger.warn(
    '⚠️ DEV AUTH BYPASS ENABLED — never deploy with DEV_AUTH_ENABLED=true on prod',
    'AuthModule',
  );
}

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'defaultSecret',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers,
  providers: [AuthService, SupabaseStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
