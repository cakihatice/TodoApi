using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TodoApi.Infrastructure.Data;
using TodoApi.Domain.Interfaces;
using TodoApi.Infrastructure.Repositories;
using TodoApi.Application.Common;
using TodoApi.Application.Commands;
using TodoApi.Application.Queries;
using TodoApi.Application.CommandHandlers;
using TodoApi.Application.QueryHandlers;
using TodoApi.Application.DTOs;
using TodoApi.Domain.Entities;
using TodoApi.Infrastructure.Email;


// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

// Add services to the container.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ITodoRepository, TodoRepository>();
builder.Services.AddScoped<IEmailSender, LoggingEmailSender>();
// CQRS Command Handlers
builder.Services.AddScoped<ICommandHandler<CreateTodoCommand, Guid>, CreateTodoCommandHandler>();
builder.Services.AddScoped<ICommandHandler<UpdateTodoCommand, bool>, UpdateTodoCommandHandler>();
builder.Services.AddScoped<ICommandHandler<DeleteTodoCommand, bool>, DeleteTodoCommandHandler>();

// CQRS Query Handlers
builder.Services.AddScoped<IQueryHandler<GetAllTodosQuery, List<TodoDto>>, GetAllTodosQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetTodoByIdQuery, TodoDto?>, GetTodoByIdQueryHandler>();
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

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
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))

    };
});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();