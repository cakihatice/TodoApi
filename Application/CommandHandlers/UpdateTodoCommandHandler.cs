using TodoApi.Application.Commands;
using TodoApi.Application.Common;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.CommandHandlers;

public class UpdateTodoCommandHandler : ICommandHandler<UpdateTodoCommand, bool>
{
    private readonly ITodoRepository _repo;

    public UpdateTodoCommandHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(UpdateTodoCommand command)
    {
        var todo = await _repo.GetByIdAsync(command.Id);
        if (todo is null) return false;

        todo.Title = command.Title;
        todo.Description = command.Description;
        todo.IsCompleted = command.IsCompleted;

        _repo.Update(todo);
        return await _repo.SaveChangesAsync();
    }
}