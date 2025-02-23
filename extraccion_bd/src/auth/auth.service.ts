// src/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { compare } from 'bcrypt';  
import { Usuario } from '../usuarios/usuario.entity';
import * as jwt from 'jsonwebtoken';  

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async login(nom_usu: string, contra_usu: string): Promise<string> {
    const usuario = await this.usuariosService.findOneByUsername(nom_usu);

    if (!usuario) {
      throw new HttpException('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
    }

    // Comparar la contraseña ingresada con la encriptada en la BD
    const isPasswordValid = await compare(contra_usu, usuario.Contra_usu);
    if (!isPasswordValid) {
      throw new HttpException('Contraseña incorrecta', HttpStatus.UNAUTHORIZED);
    }

    const payload = { username: usuario.Nom_usu, sub: usuario.ID_usu };
    const token = jwt.sign(payload, 'tu_secreto_jwt', { expiresIn: '1h' });
    return token;
  }
}
