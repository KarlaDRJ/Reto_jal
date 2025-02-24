import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DatosService } from './datos.service';
import { DatosController } from './datos.controller';
import { DatosExtraidos } from './datos.entity';
import { UsuariosModule } from './usuarios/usuarios.module'; 
import { AuthModule } from './auth/auth.module'; 
import { Usuario } from './usuarios/usuario.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }), // Carga el archivo .env y lo hace global
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [DatosExtraidos, Usuario],
        synchronize: true,
      }),
      inject: [ConfigService], // Inyecta el servicio ConfigService
    }),
    TypeOrmModule.forFeature([DatosExtraidos]),
    UsuariosModule,
    AuthModule,
  ],
  controllers: [DatosController],
  providers: [DatosService],
})
export class AppModule {}
