import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DatosService } from './datos.service';
import { DatosController } from './datos.controller';
import { DatosExtraidos } from './datos.entity';
import { UsuariosModule } from './usuarios/usuarios.module'; 
import { AuthModule } from './auth/auth.module';  // Importa AuthModule aquí
import { Usuario } from './usuarios/usuario.entity';


@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'Transporte',  
      password: '1234',  
      database: 'Bd_transporte', 
      entities: [DatosExtraidos, Usuario],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([DatosExtraidos]),
    UsuariosModule,
    AuthModule,
 
  ],
  controllers: [DatosController],
  providers: [DatosService],
})
export class AppModule {}
