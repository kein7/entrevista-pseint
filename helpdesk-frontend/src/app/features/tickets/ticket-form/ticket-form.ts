import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService, Ticket } from '../../../core/services/ticket';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
})
export class TicketForm {
  private fb = inject(FormBuilder).nonNullable;
  private ticketService = inject(TicketService);

  ticketCreated = output<Ticket>();
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ticketForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    priority: [1, [Validators.required]],
    assignedUser: ['admin', [Validators.required]],
  });

  isInvalid(field: string): boolean {
    const control = this.ticketForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.ticketForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.ticketForm.getRawValue();

    const ticketToCreate = {
      title: formValue.title,
      description: formValue.description,
      priority: Number(formValue.priority), // <--- CRÍTICO: Convertir string a number
      assignedUser: formValue.assignedUser,
      status: 0, // Asumimos 0 como 'Abierto' por defecto
    };
    this.ticketService.createTicket(ticketToCreate as Ticket).subscribe({
      next: (newTicket) => {
        this.ticketCreated.emit(newTicket);
        this.ticketForm.reset({ priority: 1, assignedUser: 'admin' });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 400) {
          this.errorMessage.set('Revisa los campos obligatorios.');
        } else {
          this.errorMessage.set('Ocurrió un error inesperado al conectar con el servidor.');
        }
      },
    });
  }
}
