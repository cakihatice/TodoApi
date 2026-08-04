using TodoApi.Application.Common;

namespace TodoApi.Application.Commands;

public record CreateTodoCommand(string Title, string? Description, DateTime? DueDate, Guid? RequestId) : ICommand<Guid>;