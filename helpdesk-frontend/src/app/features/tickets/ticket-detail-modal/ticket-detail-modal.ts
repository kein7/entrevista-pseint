import { Component, input, output, effect, inject } from '@angular/core';
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

  // TODO: MOSTRAR MENSAJE DE ERROR

  ticket = input.required<Ticket>();
  close = output();
  updated = output<Ticket>();

  private fb = inject(FormBuilder);
  editForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  });

  // Usamos effect o ngOnInit para cargar los datos cuando llega el ticket
  constructor() {
    effect(() => {
      this.editForm.patchValue({
        title: this.ticket().title,
        description: this.ticket().description,
      });
    });
  }

  save() {
    if (this.editForm.invalid) return;

    const id = this.ticket().id;
    if (!id) return;

    // Creamos el objeto con los datos del formulario + los datos que no cambian (como el id)
    const dataToUpdate: Ticket = {
      ...this.ticket(),
      ...(this.editForm.getRawValue() as Ticket),
    };

    this.ticketService.updateTicket(id, dataToUpdate).subscribe({
      next: (savedTicket) => {
        this.updated.emit(savedTicket); // Avisamos al padre con el objeto real del server
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
      },
    });
  }
}
