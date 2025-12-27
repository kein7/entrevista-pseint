import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService, Ticket } from '../../../core/services/ticket';
import { AuthService } from '../../../core/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketFormComponent } from '../ticket-form/ticket-form';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, TicketFormComponent],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private ticketService = inject(TicketService);
  authService = inject(AuthService);

  tickets: WritableSignal<Ticket[]> = signal<Ticket[]>([]);

  ngOnInit() {
    this.loadTickets();
  }

  // Método para formatear prioridades (Mejora el UX)
  getPriorityLabel(priority: number): string {
    const labels = ['Baja', 'Media', 'Alta'];
    return labels[priority] || 'Desconocida';
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe((data) => this.tickets.set(data));
  }

  // Este método se ejecuta cuando el hijo emite el evento
  onTicketCreated(newTicket: Ticket) {
    this.tickets.update((all) => [newTicket, ...all]);
  }
}
