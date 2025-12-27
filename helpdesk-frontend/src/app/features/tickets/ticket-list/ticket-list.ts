import { Component, inject, effect, WritableSignal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
export class TicketList {
  private ticketService = inject(TicketService);
  authService = inject(AuthService);

  tickets: WritableSignal<Ticket[]> = signal<Ticket[]>([]);

  selectedTicket = signal<Ticket | null>(null);

  currentPage = signal<number>(1);
  pageSize = 5;

  searchTerm = signal<string>('');
  private searchSubject = new Subject<string>();

  filterStatus = signal<string>('all');
  filterPriority = signal<string>('all');

  filteredTickets = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.tickets().filter((ticket) => {
      const matchStatus =
        this.filterStatus() === 'all' || ticket.status?.toString() === this.filterStatus();

      const matchPriority =
        this.filterPriority() === 'all' || ticket.priority?.toString() === this.filterPriority();

      const matchSearch = term === '' || ticket.title.toLowerCase().includes(term);

      return matchStatus && matchPriority && matchSearch;
    });
  });

  paginatedTickets = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTickets().slice(startIndex, endIndex);
  });

  totalPages = computed(() => Math.ceil(this.filteredTickets().length / this.pageSize));

  constructor() {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.searchTerm.set(value);
    });

    effect(
      () => {
        // Cada vez que cualquiera de estas señales cambie, volvemos a la página 1
        this.searchTerm();
        this.filterStatus();
        this.filterPriority();
        this.resetPagination();
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    this.loadTickets();
  }

  openModal(ticket: Ticket) {
    this.selectedTicket.set(ticket);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  // Método para formatear prioridades (Mejora el UX)
  getPriorityLabel(priority: number): string {
    const labels = ['Baja', 'Media', 'Alta'];
    return labels[priority] || 'Desconocida';
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  resetPagination() {
    this.currentPage.set(1);
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
