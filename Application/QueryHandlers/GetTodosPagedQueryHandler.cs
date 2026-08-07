using TodoApi.Application.Common;
using TodoApi.Application.DTOs;
using TodoApi.Application.Queries;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.QueryHandlers;

public class GetTodosPagedQueryHandler : IQueryHandler<GetTodosPagedQuery, PagedResult<TodoDto>>
{
    private readonly ITodoRepository _repo;

    public GetTodosPagedQueryHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<PagedResult<TodoDto>> Handle(GetTodosPagedQuery query)
    {
        var (items, totalCount) = await _repo.GetPagedAsync(query.PageNumber, query.PageSize);

        var dtos = items
            .Select(t => new TodoDto(t.Id, t.Title, t.Description, t.IsCompleted, t.CreatedAt, t.DueDate))
            .ToList();

        return new PagedResult<TodoDto>
        {
            Items = dtos,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize,
            TotalCount = totalCount
        };
    }
}