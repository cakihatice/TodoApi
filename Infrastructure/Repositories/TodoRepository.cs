using Microsoft.EntityFrameworkCore;
using TodoApi.Domain.Entities;
using TodoApi.Domain.Interfaces;
using TodoApi.Infrastructure.Data;

namespace TodoApi.Infrastructure.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly AppDbContext _context;

    public TodoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TodoItem>> GetAllAsync()
    {
        return await _context.Todos
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<TodoItem?> GetByIdAsync(Guid id)
    {
        return await _context.Todos.FindAsync(id);
    }
    public async Task<TodoItem?> GetByRequestIdAsync(Guid requestId)
    {
        return await _context.Todos
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.RequestId == requestId);
    }

    public async Task AddAsync(TodoItem item)
    {
        await _context.Todos.AddAsync(item);
    }

    public void Update(TodoItem item)
    {
        _context.Todos.Update(item);
    }

    public void Delete(TodoItem item)
    {
        _context.Todos.Remove(item);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}