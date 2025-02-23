import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Chart, ChartData, ChartOptions,registerables } from 'chart.js';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})

export class DashboardComponent {
  
  filtroForm: FormGroup;
  
  estadisticas: any = {
    ingresosPorPasaje: 0,
    kilometrosRecorridos: 0,
    longitudDelServicio: 0,
    pasajerosTransportados: 0,
    unidadesEnOperacion: 0,
  };
private isNavigationBlocked = false;

  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService, private router: Router) {
    this.filtroForm = this.fb.group({
      anio: [''],
      mesInicio: [''],
      mesFin: [''],
      transporte: ['todos'],
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    // Si el usuario está autenticado y la navegación no está bloqueada
    if (this.authService.isAuthenticated() && !this.isNavigationBlocked) {
      // Inmediatamente hace logout y lo redirige al login
      this.authService.logout();
      this.router.navigate(['/login']); // Redirige al login
    }
  }

  salir() {
    const confirmLogout = confirm('¿Estás seguro de que deseas salir?');
    if (confirmLogout) {
      this.authService.logout();  // Llama al método logout del servicio de autenticación
      this.router.navigate(['/login']);  // Redirige a la página de login
    }
  }


  transportes = [
    "Tren Eléctrico",
    "Macrobús Servicio Alimentador",
    "Mi Transporte Eléctrico",
    "MI Macro Periférico Alimentador",
    "Trolebús",
    "Sistema Integral del Tren Ligero",
    "Mi Macro Periférico Alimentador",
    "Mi Macro Periférico Troncal",
    "Macrobús Servicio Troncal",
  ];

  // Variables para almacenar las instancias de las gráficas
  private chartIngresos: Chart | null = null;
  private chartKm: Chart | null = null;
  private chartLongitud: Chart | null = null;
  private chartPasajeros: Chart | null = null;
  private chartComparativa: Chart | null = null;

  

  obtenerEstadisticas() {
    const filtros = this.filtroForm.value;
    let paramsObj: any = {};
    if (filtros.anio) {
      paramsObj.anio = filtros.anio.toString();
    }
    if (filtros.mesInicio) {
      paramsObj.mesInicio = filtros.mesInicio.toString();
    }
    if (filtros.mesFin) {
      paramsObj.mesFin = filtros.mesFin.toString();
    }
    if (filtros.transporte && filtros.transporte !== 'todos') {
      paramsObj.transporte = filtros.transporte;
    }
    const params = new HttpParams({ fromObject: paramsObj });
    const url = 'http://localhost:3000/datos/dashboard';

    this.http.get<any>(url, { params }).subscribe(
      response => {
        console.log("Respuesta del backend:", response);
        if (response && response.estadisticas) {
          this.estadisticas = response.estadisticas;

          // Calcular la suma total de todos los valores numéricos en estadisticas
          this.estadisticas.totalSuma = Object.values(this.estadisticas)
            .filter(value => typeof value === 'number')  // Filtrar solo los números
            .reduce((sum: number, current: number) => sum + current, 0);
        } else {
          console.warn("No se encontró 'estadisticas' en la respuesta. Usando valores por defecto.");
          this.estadisticas = {
            ingresosPorPasaje: 0,
            kilometrosRecorridos: 0,
            longitudDelServicio: 0,
            pasajerosTransportados: 0,
            unidadesEnOperacion: 0,
            totalIngresos: 0,
            totalSuma: 0,  // Incluir la suma total con valor 0 en caso de error
          };
        }
        this.renderizarGraficas(this.estadisticas);
      },
      error => {
        console.error("Error al obtener los datos del dashboard:", error);
        this.estadisticas = {
          ingresosPorPasaje: 0,
          kilometrosRecorridos: 0,
          longitudDelServicio: 0,
          pasajerosTransportados: 0,
          unidadesEnOperacion: 0,
          totalIngresos: 0,
          totalSuma: 0,  // Incluir la suma total con valor 0 en caso de error
        };
      }
    );
  }

  renderizarGraficas(estadisticas: any) {
    console.log(estadisticas.ingresosPorPasaje);
    console.log("Renderizando gráficas con:", estadisticas);

    // Destruir gráficas anteriores si existen
    if (this.chartIngresos) { this.chartIngresos.destroy(); }
    if (this.chartKm) { this.chartKm.destroy(); }
    if (this.chartLongitud) { this.chartLongitud.destroy(); }
    if (this.chartPasajeros) { this.chartPasajeros.destroy(); }
    if (this.chartComparativa) { this.chartComparativa.destroy(); }

    // Opciones comunes para títulos y leyendas
    const commonOptions = {
      responsive: false,
      plugins: {
        legend: { 
          display: true, 
          position: 'top' as const, // Aquí se especifica el tipo esperado
        },
      }
    };

    // Gráfica: Ingresos por Pasaje (Bar Chart)
    const ingresosCtx = document.getElementById('ingresosPorPasajeChart') as HTMLCanvasElement | null;

if (ingresosCtx && typeof estadisticas.ingresosPorPasaje === 'object' && estadisticas.ingresosPorPasaje !== null) {
  const labels: string[] = Object.keys(estadisticas.ingresosPorPasaje); // Nombres de los transportes
  const data: number[] = Object.values(estadisticas.ingresosPorPasaje).map(valor => Number(valor) || 0); // Convierte a números

  // Definir los datos del gráfico
  const chartData: ChartData<'bar', number[], string> = {
    labels: labels,
    datasets: [{
      label: 'Ingresos por Pasaje',
      data: data,
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 205, 86, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Opciones del gráfico
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Ingresos por Pasaje por Tipo de Transporte' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Crear el gráfico con tipado correcto
  this.chartIngresos = new Chart<'bar', number[], string>(ingresosCtx, {
    type: 'bar',
    data: chartData,
    options: chartOptions
  });

} else {
  console.error('Error: estadisticas.ingresosPorPasaje no es un objeto válido o el canvas no existe.');
}

    // Gráfica: Kilómetros Recorridos (Line Chart)
    const kmCtx = document.getElementById('kilometrosRecorridosChart') as HTMLCanvasElement;
    this.chartKm = new Chart(kmCtx, {
      type: 'line',
      data: {
        labels: ['Kilómetros Recorridos'],
        datasets: [{
          label: 'Kilómetros Recorridos',
          data: [estadisticas.kilometrosRecorridos],
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: { display: true, text: 'Kilómetros Recorridos' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Gráfica: Longitud del Servicio (Pie Chart)
    const longitudCtx = document.getElementById('longitudDelServicioChart') as HTMLCanvasElement;
    this.chartLongitud = new Chart(longitudCtx, {
      type: 'pie',
      data: {
        labels: ['Longitud del Servicio'],
        datasets: [{
          label: 'Longitud del Servicio',
          data: [estadisticas.longitudDelServicio],
          backgroundColor: ['rgba(255, 159, 64, 0.5)'],
          borderColor: ['rgba(255, 159, 64, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: { display: true, text: 'Longitud del Servicio' }
        }
      }
    });

    // Gráfica: Pasajeros Transportados (Doughnut Chart)
    const pasajerosCtx = document.getElementById('pasajerosTransportadosChart') as HTMLCanvasElement;
    this.chartPasajeros = new Chart(pasajerosCtx, {
      type: 'doughnut',
      data: {
        labels: ['Pasajeros Transportados'],
        datasets: [{
          label: 'Pasajeros Transportados',
          data: [estadisticas.pasajerosTransportados],
          backgroundColor: ['rgba(255, 205, 86, 0.5)'],
          borderColor: ['rgba(255, 205, 86, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: { display: true, text: 'Pasajeros Transportados' }
        }
      }
    });

    const comparativaCtx = document.getElementById('comparativaChart') as HTMLCanvasElement | null;

if (comparativaCtx && estadisticas) {
  // Convertir los valores de las métricas a números para evitar errores de tipo
  const data: number[] = [
    Number(estadisticas.ingresosPorPasaje) || 0,
    Number(estadisticas.kilometrosRecorridos) || 0,
    Number(estadisticas.longitudDelServicio) || 0,
    Number(estadisticas.pasajerosTransportados) || 0,
    Number(estadisticas.unidadesEnOperacion) || 0
  ];

  // Datos de la gráfica
  const chartData: ChartData<'line', number[], string> = {
    labels: ['Ingresos', 'Kilómetros', 'Longitud', 'Pasajeros', 'Unidades'],
    datasets: [{
      label: 'Comparativa de Métricas',
      data: data,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1
    }]
  };

  // Opciones de la gráfica
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Comparativa de Métricas' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Crear la gráfica sin errores de tipo
  this.chartComparativa = new Chart<'line', number[], string>(comparativaCtx, {
    type: 'line',
    data: chartData,
    options: chartOptions
  });

} else {
  console.error('Error: No se encontró el canvas comparativaChart o estadisticas no está definido.');
}
  }
}
