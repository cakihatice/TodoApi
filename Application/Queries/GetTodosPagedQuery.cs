using TodoApi.Application.Common;
using TodoApi.Application.DTOs;

namespace TodoApi.Application.Queries;

public record GetTodosPagedQuery(int PageNumber = 1, int PageSize = 10)
    : IQuery<PagedResult<TodoDto>>;