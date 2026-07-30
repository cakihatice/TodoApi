using TodoApi.Application.Common;
using TodoApi.Application.DTOs;
using TodoApi.Application.Queries;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.QueryHandlers;

public class GetAllTodosQueryHandler : IQueryHandler<GetAllTodosQuery, List<TodoDto>>
{
    private readonly ITodoRepository _repo;

    public GetAllTodosQueryHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<TodoDto>> Handle(GetAllTodosQuery query)
    {
        var todos = await _repo.GetAllAsync();

        return todos
            .Select(t => new TodoDto(t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt,t.DueDate))
            .ToList();
    }
}