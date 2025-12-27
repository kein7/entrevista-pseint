using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HelpDesk.Api.Controllers;
using HelpDesk.Domain.Entities;
using HelpDesk.Infrastructure.Persistence;
using HelpDesk.Application.Validators; // Asegúrate de importar el namespace de tu validador
using Xunit;
using System.Collections.Generic;
using System.Linq;

public class TicketsControllerTests
{
    private AppDbContext GetDbContext()
    {
        // Uso de InMemoryDatabase según los requisitos técnicos 
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetTickets_ReturnsAllTickets()
    {
        // 1. 
        var context = GetDbContext();
        var validator = new CreateTicketValidator(); // Instanciamos el validador real

        context.Tickets.Add(new Ticket
        {
            Id = 1,
            Title = "Test Ticket 1",
            Description = "Descripción de más de 10 caracteres",
            Priority = Priority.Low,
            Status = Status.New,
            AssignedUser = "admin", // Campo requerido 
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        // 2. Ahora pasamos ambos argumentos al constructor
        var controller = new TicketsController(validator, context);
        var result = await controller.GetTickets();

        // 3. 
        var tickets = Assert.IsAssignableFrom<IEnumerable<Ticket>>(result.Value);
        Assert.Single(tickets); // Verificamos que hay exactamente 1
    }
}