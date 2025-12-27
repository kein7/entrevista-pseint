import { Component, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ticket, TicketService } from '../../../core/services/ticket';

@Component({
  selector: 'app-ticket-detail-modal',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ticket-detail-modal.html',
  styleUrl: './ticket-detail-modal.scss',
})
export class TicketDetailModal {
  ticketService = inject(TicketService);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  ticket = input.required<Ticket>();
  close = output();
  updated = output<Ticket>();

  private fb = inject(FormBuilder).nonNullable;
  editForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: [0, Validators.required],
    status: [0, Validators.required],
    assignedUser: ['', Validators.required],
  });

  constructor() {
    document.body.style.overflow = 'hidden';

    effect(() => {
      const t = this.ticket();
      if (t) {
        this.editForm.patchValue({
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          assignedUser: t.assignedUser,
        });
      }
    });
  }

  ngOnDestroy() {
    // Cuando se cierra (destruye), devolvemos el scroll
    document.body.style.overflow = 'auto';
  }

  isInvalid(field: string): boolean {
    const control = this.editForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  save() {
    this.isLoading.set(true);
    if (this.editForm.invalid) return;

    const id = this.ticket().id;
    if (!id) return;
    this.errorMessage.set(null);
    // Creamos el objeto con los datos del formulario + los datos que no cambian (como el id)
    const formValue = this.editForm.getRawValue();
    const dataToUpdate: Ticket = {
      ...this.ticket(),
      ...formValue,
      priority: Number(formValue.priority),
      status: Number(formValue.status),
    };

    this.ticketService.updateTicket(id, dataToUpdate).subscribe({
      next: (savedTicket) => {
        this.updated.emit(savedTicket); // Avisamos al padre con el objeto real del server
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
