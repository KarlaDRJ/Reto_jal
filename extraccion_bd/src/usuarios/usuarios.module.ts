
// src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { AuthModule } from '../auth/auth.module';  // Asegúrate de importar el AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),  
    AuthModule,  
  ],
 
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],  // Asegúrate de exportar UsuariosService si se necesita en otros módulos
})
export class UsuariosModule {}
