import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard'; // Asegúrate de importar el AuthGuard


const routes: Routes = [
  { path: 'login', component: LoginComponent },  // Definir la ruta para el login
  { path: '', component: LoginComponent }, // Ruta por defecto a LoginComponent
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, // Protege el dashboard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }