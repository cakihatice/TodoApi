using Microsoft.EntityFrameworkCore;
using TodoApi.Domain.Entities;

namespace TodoApi.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    public DbSet<TodoItem> Todos { get; set; }
    }
}