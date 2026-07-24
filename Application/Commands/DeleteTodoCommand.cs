using TodoApi.Application.Common;

namespace TodoApi.Application.Commands;

public record DeleteTodoCommand(Guid Id) : ICommand<bool>;