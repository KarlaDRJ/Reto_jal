import { Controller, Get } from '@nestjs/common';
import { DatosService } from './datos.service';

@Controller('datos')
export class DatosController {
  constructor(private readonly datosService: DatosService) {}

  @Get('extraer')
  async extraerDatos() {
    return this.datosService.extraerDatos();
  }
}
