// src/usuarios/usuarios.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const token = await this.authService.login(username, password);
    return { token };
  }

  @Get('hash-passwords') //Endpoint temporal
  async hashPasswords() {
    await this.usuariosService.hashExistingPasswords();
    return { message: 'Proceso de encriptación completado' };
  }
}
