using FluentValidation;
using HelpDesk.Api.DTOs;
using HelpDesk.Domain.Entities;
using HelpDesk.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Net.Sockets;

namespace HelpDesk.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly IValidator<Ticket> _validator;
        private readonly AppDbContext _context;

        public TicketsController(IValidator<Ticket> validator, AppDbContext context)
        {
            _validator = validator;
            _context = context;
        }

        // GET: api/tickets (Listado y filtrado) 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets(
            [FromQuery] Status? status = null,
            [FromQuery] Priority? priority = null)
        {
           
            var query = _context.Tickets.AsQueryable();

            if (status.HasValue) query = query.Where(t => t.Status == status);
            if (priority.HasValue) query = query.Where(t => t.Priority == priority);

            return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        }

        // POST: api/tickets (Creación con estado 'Nuevo') 
        [HttpPost]
        public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
        {
            var validationResult = await _validator.ValidateAsync(ticket);

            if (!validationResult.IsValid)
            {
                // Devuelve los errores formateados para que Angular los muestre 
                return BadRequest(validationResult.Errors.Select(e => new {
                    Property = e.PropertyName,
                    Message = e.ErrorMessage
                }));
            }

            ticket.CreatedAt = DateTime.UtcNow; 
            ticket.Status = Status.New; // Forzamos estado inicial 

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTickets), new { id = ticket.Id }, ticket);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] TicketUpdateDto ticketDto)
        {
            // 1. Validar que el ID de la URL coincida con el objeto (Seguridad básica)

            var existingTicket = await _context.Tickets.FindAsync(id);
            if (existingTicket == null)
            {
                return NotFound(new { message = "El ticket no existe" });
            }
            if (!Enum.IsDefined(typeof(Priority), ticketDto.Priority))
            {
                return BadRequest("La prioridad proporcionada no es válida.");
            }
            if (!Enum.IsDefined(typeof(Status), ticketDto.Status))
            {
                return BadRequest("El estado proporcionado no es válido.");
            }

            // 2. Actualizar campos
            existingTicket.Title = ticketDto.Title;
            existingTicket.Description = ticketDto.Description;
            existingTicket.Priority = (Priority)ticketDto.Priority;
            existingTicket.Status = (Status)ticketDto.Status;
            existingTicket.AssignedUser = ticketDto.AssignedUser;

            var validationResult = await _validator.ValidateAsync(existingTicket);
            if (!validationResult.IsValid) return BadRequest(validationResult.Errors);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error de concurrencia al guardar");
            }

            return Ok(existingTicket); 
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto statusDto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            if (!Enum.IsDefined(typeof(Status), statusDto.Status))
            {
                return BadRequest("El estado proporcionado no es válido.");
            }

            ticket.Status = (Status)statusDto.Status;
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }
    }
}
