import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/schema/user.schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from 'src/dto/login.dto/login.dto';
import { LoginResponse } from 'src/dto/user.dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto/create-user.dto';
import { TokenBlacklistService } from 'src/token-blacklist/token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password!');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password!');
    }
    const { password: _, ...result } = user.toJSON();
    return result as User;
  }

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { username, email, password } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    console.log(user);
    console.log('user');
    const payload = { sub: user._id, username: user.username, id: user._id };
    console.log(payload);
    const accessToken = this.jwtService.sign(payload);
    console.log(accessToken);
    return new LoginResponse(user, accessToken);
  }

  async validateToken(token: string): Promise<User> {
    const payload = this.jwtService.verify(token);
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token!');
    }

    if (await this.tokenBlacklistService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token is blacklisted!');
    }

    return user;
  }


  async logout(token: string): Promise<void> {
    await this.tokenBlacklistService.addTokenToBlacklist(token);
  }
}
