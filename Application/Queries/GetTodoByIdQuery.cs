using TodoApi.Application.Common;
using TodoApi.Application.DTOs;

namespace TodoApi.Application.Queries;

public record GetTodoByIdQuery(Guid Id) : IQuery<TodoDto?>;