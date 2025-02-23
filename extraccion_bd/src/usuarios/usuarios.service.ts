// src/usuarios/usuarios.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async findOneByUsername(username: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({ where: { Nom_usu: username } });
  }

  async hashExistingPasswords(): Promise<void> {
    console.log('Iniciando encriptación de contraseñas...');
    
    const usuarios = await this.usuariosRepository.find();
    
    for (const usuario of usuarios) {
      if (!usuario.Contra_usu.startsWith('$2b$')) {  
        console.log(`Hasheando contraseña para el usuario: ${usuario.Nom_usu}`);
        
        const hashedPassword = await bcrypt.hash(usuario.Contra_usu, 10);
        usuario.Contra_usu = hashedPassword;
        
        await this.usuariosRepository.save(usuario);
      } else {
        console.log(`Usuario ${usuario.Nom_usu} ya tiene contraseña encriptada.`);
      }
    }
    
    console.log(' Proceso de encriptación finalizado.');
  }
}
