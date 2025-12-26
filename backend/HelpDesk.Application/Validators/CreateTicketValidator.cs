using FluentValidation;
using HelpDesk.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Application.Validators;

public class CreateTicketValidator : AbstractValidator<Ticket>
{
    public CreateTicketValidator()
    {
        // Validación del Título 
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("El título es obligatorio.")
            .MaximumLength(100).WithMessage("El título no puede exceder los 100 caracteres.");

        // Validación de la Descripción 
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("La descripción es requerida.")
            .MinimumLength(10).WithMessage("La descripción debe tener al menos 10 caracteres.");

        // Validación de Prioridad 
        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("La prioridad seleccionada no es válida.");

        // Validación de Estado 
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("El estado seleccionado no es válido.");

        // Validación de Usuario Asignado [cite: 15]
        RuleFor(x => x.AssignedUser)
            .MaximumLength(50).WithMessage("El nombre del usuario asignado es demasiado largo.");
    }
}
