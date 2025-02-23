// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { nom_usu: string; contra_usu: string }) {
    const { nom_usu, contra_usu } = body;
    try {
      const message = await this.authService.login(nom_usu, contra_usu);
      return { message };
    } catch (error) {
      return { error: error.message };
    }
  }
}
