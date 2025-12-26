using HelpDesk.Infrastructure; // Importante para ver el método de extensión
using HelpDesk.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar servicios de las capas inferiores
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Habilitar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // URL estándar de Angular 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Requisito 

var app = builder.Build();

app.UseMiddleware<HelpDesk.Api.Middleware.ExceptionMiddleware>();

// 3. Middleware Global de Errores y Swagger 
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AngularPolicy"); // Aplicar CORS 
app.UseAuthentication(); // Para el requisito de login 
app.UseAuthorization();

// Aplicar migraciones automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated(); // Crea el archivo .db y las tablas si no existen
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al crear la base de datos.");
    }
}

app.MapControllers();
app.Run();