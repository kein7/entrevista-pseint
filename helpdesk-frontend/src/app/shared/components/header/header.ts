import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);

  // Obtenemos el nombre del usuario guardado en el login
  username = localStorage.getItem('username') || 'Usuario';

  logout() {
    this.authService.logout();
  }
}
