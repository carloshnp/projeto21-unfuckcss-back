import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/dto/create-user.dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto/login.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.authService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    console.log(process.env.JWT_SECRET)
    const { accessToken } = await this.authService.login(loginDto);
    return { access_token: accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req): Promise<void> {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logout(token);
  }
}