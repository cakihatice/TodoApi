using TodoApi.Domain.Entities;

namespace TodoApi.Domain.Interfaces;

public interface ITodoRepository
{
    Task<List<TodoItem>> GetAllAsync();
    Task<(List<TodoItem> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
    Task<TodoItem?> GetByIdAsync(Guid id);
    Task AddAsync(TodoItem item);
    void Update(TodoItem item);
    void Delete(TodoItem item);
    Task<bool> SaveChangesAsync();
    Task<TodoItem?> GetByRequestIdAsync(Guid requestId);
}