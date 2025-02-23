import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { DatosExtraidos } from './datos.entity';

@Injectable()
export class DatosService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(DatosExtraidos)
    private datosRepository: Repository<DatosExtraidos>,
  ) {}

  async extraerDatos() {
    try {
      // Realizamos la solicitud a la API externa
      const response = await firstValueFrom(
        this.httpService.get('http://apiiieg.jalisco.gob.mx/api/etup'),
      );

      // Imprimimos la respuesta completa de la API para ver su estructura
      console.log('Respuesta de la API:', response.data);

      // Accedemos a la propiedad "data" que contiene el array
      const datos = response.data.data; 

      // Verificamos si la propiedad "data" es un array
      if (!Array.isArray(datos)) {
        throw new Error('La propiedad "data" no es un array');
      }

      // Guardamos los datos extraídos en la base de datos
      
      for (const item of datos) {

        // Validamos que el campo "Valor" no sea nulo o indefinido
        if (item.Valor === null || item.Valor === undefined) {
          item.Valor = 0;  // Asignamos un valor por defecto (puedes modificar esto según tu lógica)
        }

        const newData = this.datosRepository.create(item); 
        console.log('Datos a guardar:', newData); 
        await this.datosRepository.save(newData);  // Guardamos los datos en la base de datos
        console.log('Datos a guardar:', newData); 
      }


      return { message: 'Datos extraídos y guardados correctamente', datos };
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return { message: 'Hubo un error al extraer los datos', error: error.message };
    }
  }
}
