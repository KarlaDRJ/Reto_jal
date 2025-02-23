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







  async obtenerDashboard(anio: number, mesInicio: number, mesFin: number, transporte: string) {
    try {
      const queryBuilder = this.datosRepository.createQueryBuilder('datos');
  
      if (anio) {
        queryBuilder.andWhere('datos."Anio" = :anio', { anio });
      }
  
      if (mesInicio) {
        queryBuilder.andWhere('datos."ID_mes" >= :mesInicio', { mesInicio });
      }
  
      if (mesFin) {
        queryBuilder.andWhere('datos."ID_mes" <= :mesFin', { mesFin });
      }
  
      if (transporte && transporte !== 'todos') {
        const searchTransporte = `%${transporte.trim().replace(/\s+/g, ' ')}%`;
        queryBuilder.andWhere('datos."Transporte" LIKE :transporte', { transporte: searchTransporte });
      }
  
      const result = await queryBuilder.getMany();
  
      if (result.length === 0) {
        return { message: 'No se encontraron datos con los filtros proporcionados.' };
      }
  
      const estadisticas = {
        ingresosPorPasaje: {},
        kilometrosRecorridos: 0,
        longitudDelServicio: 0,
        pasajerosTransportados: 0,
        unidadesEnOperacion: 0,
      };
  
      result.forEach(item => {
        const valor = Number(item.Valor) || 0;
  
        switch (item.Variable) {
          case 'Ingresos por pasaje':
            if (!estadisticas.ingresosPorPasaje[item.Transporte]) {
              estadisticas.ingresosPorPasaje[item.Transporte] = 0;
            }
            estadisticas.ingresosPorPasaje[item.Transporte] += valor;
            break;
          case 'Kilómetros recorridos':
            estadisticas.kilometrosRecorridos += valor;
            break;
          case 'Longitud de servicio':
            estadisticas.longitudDelServicio += valor;
            break;
          case 'Pasajeros transportados':
            estadisticas.pasajerosTransportados += valor;
            break;
          case 'Unidades en operación':
            estadisticas.unidadesEnOperacion += valor;
            break;
          default:
            console.warn(`Variable desconocida: ${item.Variable}`);
            break;
        }
      });
  
      return {
        datos: result,
        estadisticas,
      };
  
    } catch (error) {
      console.error('Error al obtener los datos filtrados:', error);
      return { message: 'Hubo un error al obtener los datos filtrados', error: error.message };
    }
  }
  
  
  
  
}