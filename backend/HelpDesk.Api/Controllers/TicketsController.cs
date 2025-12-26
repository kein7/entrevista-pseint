using HelpDesk.Domain.Entities;
using HelpDesk.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/tickets (Listado y filtrado) 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets(
            [FromQuery] Status? status,
            [FromQuery] Priority? priority)
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
            ticket.CreatedAt = DateTime.UtcNow; 
            ticket.Status = Status.New; // Forzamos estado inicial 

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTickets), new { id = ticket.Id }, ticket);
        }
    }
}
