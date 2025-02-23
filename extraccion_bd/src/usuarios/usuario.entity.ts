// src/usuarios/usuario.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  ID_usu: number;

  @Column()
  Nom_usu: string;

  @Column()
  Contra_usu: string;

  
}
