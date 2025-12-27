using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HelpDesk.Api.Controllers;
using HelpDesk.Domain.Entities;
using HelpDesk.Infrastructure.Persistence;
using Xunit;

public class TicketsControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetTickets_ReturnsAllTickets()
    {
        var context = GetDbContext();
        context.Tickets.Add(new Ticket { Id = 1, Title = "Test 1", Description = "Desc" });
        context.Tickets.Add(new Ticket { Id = 2, Title = "Test 2", Description = "Desc" });
        await context.SaveChangesAsync();

        var controller = new TicketsController(context);

        var result = await controller.GetTickets();

        var tickets = Assert.IsAssignableFrom<IEnumerable<Ticket>>(result.Value);
        Assert.NotNull(tickets);
        Assert.Equal(2, tickets.Count());
    }
}