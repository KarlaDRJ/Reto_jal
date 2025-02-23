import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
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
        } else {
          console.warn("No se encontró 'estadisticas' en la respuesta. Usando valores por defecto.");
          this.estadisticas = {
            ingresosPorPasaje: 0,
            kilometrosRecorridos: 0,
            longitudDelServicio: 0,
            pasajerosTransportados: 0,
            unidadesEnOperacion: 0,
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
    const ingresosCtx = document.getElementById('ingresosPorPasajeChart') as HTMLCanvasElement;
    this.chartIngresos = new Chart(ingresosCtx, {
      type: 'bar',
      data: {
        labels: ['Ingresos por pasaje'],
        datasets: [{
          label: 'Ingresos por Pasaje',
          data: [estadisticas.ingresosPorPasaje],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: { display: true, text: 'Ingresos por Pasaje' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

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

    // Gráfica Comparativa: Comparativa de Métricas (Line Chart)
    const comparativaCtx = document.getElementById('comparativaChart') as HTMLCanvasElement;
    this.chartComparativa = new Chart(comparativaCtx, {
      type: 'line',
      data: {
        labels: ['Ingresos', 'Kilómetros', 'Longitud', 'Pasajeros', 'Unidades'],
        datasets: [{
          label: 'Comparativa de Métricas',
          data: [
            estadisticas.ingresosPorPasaje,
            estadisticas.kilometrosRecorridos,
            estadisticas.longitudDelServicio,
            estadisticas.pasajerosTransportados,
            estadisticas.unidadesEnOperacion
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        plugins: {
          ...commonOptions.plugins,
          ...commonOptions,
          title: { display: true, text: 'Comparativa de Métricas' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}
