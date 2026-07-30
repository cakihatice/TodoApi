using TodoApi.Application.Common;

namespace TodoApi.Application.Commands;

public record UpdateTodoCommand(Guid Id, string Title, string? Description, bool IsCompleted, DateTime? DueDate) : ICommand<bool>;