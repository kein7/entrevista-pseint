using HelpDesk.Api.DTOs;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HelpDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config) => _config = config;

    [HttpPost("login")]
    public IActionResult Login([FromBody] DTOs.LoginRequest request)
    {
        // Validación de credenciales preconfiguradas 
        if (request.Username == "admin" && request.Password == "123456")
        {
            var token = GenerateJwtToken(request.Username);
            return Ok(new LoginResponse(token, request.Username));
        }

        return Unauthorized(new { message = "Credenciales inválidas" });
    }

    private string GenerateJwtToken(string username)
    {
        // 1. Leer todo desde Environment (prioridad) o Config
        var key = Environment.GetEnvironmentVariable("JWT_KEY") ?? _config["Jwt:Key"];
        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? _config["Jwt:Issuer"];
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? _config["Jwt:Audience"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
        new Claim(ClaimTypes.Name, username),
        new Claim(ClaimTypes.Role, "Admin")
    };

        var token = new JwtSecurityToken(
            issuer: issuer,  
            audience: audience, 
            claims: claims,
            expires: DateTime.Now.AddHours(3),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}