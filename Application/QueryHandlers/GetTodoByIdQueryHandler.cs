using TodoApi.Application.Common;
using TodoApi.Application.DTOs;
using TodoApi.Application.Queries;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.QueryHandlers;

public class GetTodoByIdQueryHandler : IQueryHandler<GetTodoByIdQuery, TodoDto?>
{
    private readonly ITodoRepository _repo;

    public GetTodoByIdQueryHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<TodoDto?> Handle(GetTodoByIdQuery query)
    {
        var todo = await _repo.GetByIdAsync(query.Id);
        if (todo is null) return null;

        return new TodoDto(todo.Id, todo.Title, todo.Description, todo.IsCompleted, todo.CreatedAt, todo.DueDate);
    }
}