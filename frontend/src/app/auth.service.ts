import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Método para almacenar el token en el localStorage
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Lógica para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    // Aquí puedes verificar si existe un token en localStorage
    return localStorage.getItem('authToken') !== null;
  }

  // Método para hacer logout
  logout(): void {
    // Elimina el token del localStorage
    localStorage.removeItem('authToken');
  }

  // Método para hacer login
  login(username: string, password: string): boolean {
    // Lógica para autenticar al usuario (simulada)
    if (username === 'admin' && password === 'admin') {
      const token = 'some-auth-token';
      this.setAuthToken(token);  // Aquí se almacena el token
      return true;
    }
    return false;
  }
}
