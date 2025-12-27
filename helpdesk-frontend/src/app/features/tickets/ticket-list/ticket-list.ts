import { Component, inject, OnInit, WritableSignal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService, Ticket } from '../../../core/services/ticket';
import { AuthService } from '../../../core/services/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { TicketForm } from '../ticket-form/ticket-form';
import { TicketDetailModal } from '../ticket-detail-modal/ticket-detail-modal';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, TicketForm, TicketDetailModal],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private ticketService = inject(TicketService);
  authService = inject(AuthService);

  tickets: WritableSignal<Ticket[]> = signal<Ticket[]>([]);

  selectedTicket = signal<Ticket | null>(null);

  filterStatus = signal<string>('all');
  filterPriority = signal<string>('all');

  filteredTickets = computed(() => {
    return this.tickets().filter((ticket) => {
      const matchStatus =
        this.filterStatus() === 'all' || ticket.status?.toString() === this.filterStatus();

      const matchPriority =
        this.filterPriority() === 'all' || ticket.priority?.toString() === this.filterPriority();

      return matchStatus && matchPriority;
    });
  });

  ngOnInit() {
    this.loadTickets();
  }

  openModal(ticket: Ticket) {
    this.selectedTicket.set(ticket);
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

  updateStatus(id: number, newStatus: string) {
    const statusNum = Number(newStatus);
    this.ticketService.updateTicketStatus(id, statusNum).subscribe({
      next: () => {
        this.tickets.update((all) =>
          all.map((t) => (t.id === id ? { ...t, status: statusNum } : t))
        );
      },
    });
  }

  onTicketUpdated(updatedTicket: Ticket) {
    // Buscamos en el signal y reemplazamos solo el ticket que cambió
    this.tickets.update((allTickets) => {
      return allTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t));
    });

    // Cerramos el modal
    this.selectedTicket.set(null);
  }
}
