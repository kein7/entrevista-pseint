using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HelpDesk.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedTickets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "AssignedUser",
                table: "Tickets",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.InsertData(
                table: "Tickets",
                columns: new[] { "Id", "AssignedUser", "CreatedAt", "Description", "Priority", "Status", "Title" },
                values: new object[,]
                {
                    { 1, "admin@system.com", new DateTime(2025, 12, 27, 8, 52, 1, 878, DateTimeKind.Utc).AddTicks(6935), "Instalar routers y configurar VLANs", 2, 1, "Configurar entorno de red" },
                    { 2, "tech@system.com", new DateTime(2025, 12, 26, 8, 52, 1, 878, DateTimeKind.Utc).AddTicks(6937), "Actualizar licencias en todas las terminales", 1, 2, "Actualizar antivirus" },
                    { 3, "admin@system.com", new DateTime(2025, 12, 27, 6, 52, 1, 878, DateTimeKind.Utc).AddTicks(6944), "Atasco de papel recurrente en bandeja 2", 0, 0, "Error en impresora contabilidad" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Tickets",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Tickets",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Tickets",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.AlterColumn<string>(
                name: "AssignedUser",
                table: "Tickets",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }
    }
}
