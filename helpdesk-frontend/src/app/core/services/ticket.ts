import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status?: number; // 0: Abierto, 1: Cerrado (o según tu lógica)
  priority: number; // 0: Baja, 1: Media, 2: Alta
  assignedTo?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tickets`;

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.API_URL);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.API_URL, ticket);
  }
}
