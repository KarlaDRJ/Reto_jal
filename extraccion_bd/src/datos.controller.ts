import { Controller, Get, Query } from '@nestjs/common';
import { DatosService } from './datos.service';

@Controller('datos')
export class DatosController {
  constructor(private readonly datosService: DatosService) {}

  @Get('extraer')
  async extraerDatos() {
    return this.datosService.extraerDatos();
  }

  @Get('dashboard')
  async obtenerDashboard(
    @Query('anio') anio: number,
    @Query('mesInicio') mesInicio: number,
    @Query('mesFin') mesFin: number,
    @Query('transporte') transporte: string,
  ) {
    return this.datosService.obtenerDashboard(anio, mesInicio, mesFin, transporte);
  }
}
