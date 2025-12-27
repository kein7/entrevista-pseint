using HelpDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace HelpDesk.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Ticket> Tickets { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración adicional si fuera necesaria
        modelBuilder.Entity<Ticket>(entity => {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Priority).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.AssignedUser).IsRequired();
        });

        // Sembrar Tickets iniciales
        modelBuilder.Entity<Ticket>().HasData(
            new Ticket
            {
                Id = 1,
                Title = "Configurar entorno de red",
                Description = "Instalar routers y configurar VLANs",
                Priority = Priority.High,
                Status = Status.InProgress,
                CreatedAt = DateTime.UtcNow,
                AssignedUser = "admin@system.com"
            },
            new Ticket
            {
                Id = 2,
                Title = "Actualizar antivirus",
                Description = "Actualizar licencias en todas las terminales",
                Priority = Priority.Medium,
                Status = Status.Resolved,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                AssignedUser = "tech@system.com"
            },
            new Ticket
            {
                Id = 3,
                Title = "Error en impresora contabilidad",
                Description = "Atasco de papel recurrente en bandeja 2",
                Priority = Priority.Low,
                Status = Status.New,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                AssignedUser = "admin@system.com"
            }
        );
    }
}