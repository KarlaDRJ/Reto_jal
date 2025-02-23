// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';  // Asegúrate de importar el módulo correctamente
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [forwardRef(() => UsuariosModule)],  // Utiliza forwardRef para resolver la dependencia circular
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
