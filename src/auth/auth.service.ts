import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/user.schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from 'src/login.dto/login.dto';
import { LoginResponse } from 'src/user.dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/create-user.dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>, private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userModel.findOne({ email })
        if (!user) {
            throw new UnauthorizedException('Invalid email or password!')
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
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

        const user = new this.userModel({ username, email, password: hashedPassword });
        await user.save();
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload = { sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return new LoginResponse(user, accessToken);
    }
}
