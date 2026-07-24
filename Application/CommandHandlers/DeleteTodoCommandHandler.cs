using TodoApi.Application.Commands;
using TodoApi.Application.Common;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.CommandHandlers;

public class DeleteTodoCommandHandler : ICommandHandler<DeleteTodoCommand, bool>
{
    private readonly ITodoRepository _repo;

    public DeleteTodoCommandHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteTodoCommand command)
    {
        var todo = await _repo.GetByIdAsync(command.Id);
        if (todo is null) return false;

        _repo.Delete(todo);
        return await _repo.SaveChangesAsync();
    }
}