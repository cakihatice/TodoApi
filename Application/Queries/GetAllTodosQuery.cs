using TodoApi.Application.Common;
using TodoApi.Application.DTOs;

namespace TodoApi.Application.Queries;

public record GetAllTodosQuery : IQuery<List<TodoDto>>;