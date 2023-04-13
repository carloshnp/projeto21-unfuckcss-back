import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenBlacklist, TokenBlacklistDocument } from 'src/schema/token-blacklist.schema/token-blacklist.schema';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(TokenBlacklist.name)
    private readonly tokenBlacklistModel: Model<TokenBlacklistDocument>,
  ) {}

  async addTokenToBlacklist(token: string): Promise<void> {
    const existingToken = await this.tokenBlacklistModel.findOne({ token });
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 1); // expire in one day
    if (existingToken) {
      existingToken.expireAt = expireAt;
      await existingToken.save();
    } else {
      const tokenBlacklist = new this.tokenBlacklistModel({
        token,
        expireAt,
      });
      await tokenBlacklist.save();
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenBlacklist = await this.tokenBlacklistModel.findOne({ token });
    if (!tokenBlacklist) {
      return false;
    }
    return tokenBlacklist.expireAt.getTime() > Date.now();
  }
}