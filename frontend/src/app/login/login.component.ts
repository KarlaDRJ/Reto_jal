import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';  // Asegúrate de importar ReactiveFormsModule
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,  // Asegúrate de que el componente sea standalone
  imports: [ReactiveFormsModule],  // Asegúrate de importar ReactiveFormsModule
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  // Función que envía la solicitud a la API
  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      // Enviar la solicitud POST a la API
      this.http.post('http://localhost:3000/usuarios/login', loginData)
        .subscribe(
          (response) => {
            // Aquí manejas la respuesta si la autenticación es exitosa
            console.log('Login exitoso', response);
            this.router.navigate(['/dashboard']);  // Navega al dashboard si el login es exitoso
          },
          (error) => {
            // Aquí manejas el error si la autenticación falla
            console.error('Error de login', error);
            alert('Usuario o contraseña incorrectos');
          }
        );
    } else {
      console.log('Formulario inválido');
    }
  }
}
