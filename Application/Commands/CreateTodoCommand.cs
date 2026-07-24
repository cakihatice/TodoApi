using TodoApi.Application.Common;

namespace TodoApi.Application.Commands;

public record CreateTodoCommand(string Title, string? Description) : ICommand<Guid>;