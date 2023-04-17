import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/schema/user.schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenBlacklistService } from 'src/token-blacklist/token-blacklist.service';
import { TokenBlacklistSchema } from 'src/schema/token-blacklist.schema/token-blacklist.schema';
import { JwtStrategy } from './strategies/jwt/jwt.service';
import { MongooseConfigService } from 'mongoose.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'TokenBlacklist', schema: TokenBlacklistSchema },
    ]),
  ],
  providers: [AuthService, TokenBlacklistService, JwtStrategy, MongooseConfigService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
