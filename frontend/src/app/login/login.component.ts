import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';  // Asegúrate de importar ReactiveFormsModule
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,  // Asegúrate de que el componente sea standalone
  imports: [ReactiveFormsModule],  // Asegúrate de importar ReactiveFormsModule
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  // Función que envía la solicitud a la API
  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      // Enviar la solicitud POST a la API para la autenticación
      this.http.post('http://localhost:3000/usuarios/login', loginData)
        .subscribe(
          (response: any) => {
            // Suponemos que la respuesta contiene un token de autenticación
            if (response.token) {
              // Almacenar el token en el AuthService
              this.authService.setAuthToken(response.token);
              console.log('Login exitoso', response);

              // Redirigir al dashboard
              this.router.navigate(['/dashboard']);
            } else {
              // Si no se recibe un token, muestra el error
              alert('Error al recibir el token de autenticación');
            }
          },
          (error) => {
            console.error('Error de login', error);
            alert('Usuario o contraseña incorrectos');
          }
        );
    } else {
      console.log('Formulario inválido');
    }
  }
}