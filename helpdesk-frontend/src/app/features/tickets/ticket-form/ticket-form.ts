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
export class TicketFormComponent {
  private fb = inject(FormBuilder).nonNullable;
  private ticketService = inject(TicketService);

  // Nuevo en Angular 17.3+: Output con función output()
  ticketCreated = output<Ticket>();
  isLoading = signal(false);

  ticketForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    priority: [1, [Validators.required]],
  });

  onSubmit() {
    if (this.ticketForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.ticketForm.getRawValue();
    const ticketToCreate: Ticket = {
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      priority: Number(formValue.priority) ?? 1,
    };
    this.ticketService.createTicket(ticketToCreate).subscribe({
      next: (newTicket) => {
        this.ticketCreated.emit(newTicket); // Notificamos al padre
        this.ticketForm.reset({ priority: 1 });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
