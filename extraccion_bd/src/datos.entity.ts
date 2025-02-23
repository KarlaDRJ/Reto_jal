import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('datos_extraidos')
export class DatosExtraidos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  Anio: number;

  @Column()
  ID_mes: number;

  @Column()
  Transporte: string;

  @Column()
  Variable: string;

  @Column()
  ID_entidad_unico: string;

  @Column()
  ID_entidad: number;

  @Column()
  Entidad: string;

  @Column()
  ID_municipio_unico: string;

  @Column()
  ID_Municipio: number;

  @Column()
  Municipio: string;

  @Column()
  Valor: number;

  @Column()
  Estatus: string;
}
