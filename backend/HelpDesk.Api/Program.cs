using HelpDesk.Infrastructure; // Importante para ver el método de extensión
using HelpDesk.Infrastructure.Persistence;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using HelpDesk.Application.Validators;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateTicketValidator>();
// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/helpdesk-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Decirle a .NET que use Serilog en lugar del logger por defecto
builder.Host.UseSerilog();

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

// Auth JWT config
DotNetEnv.Env.Load();
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("JWT_KEY")))
{
    // Esto te ayudará a debuguear si el archivo no se encuentra
    throw new Exception("ERROR: La variable JWT_KEY no se encontró. Verifica el archivo .env");
}
var key = Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY") ?? "");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});


// app build
var app = builder.Build();
Log.Information("La API de HelpDesk ha iniciado correctamente."); 

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