using TodoApi.Application.Commands;
using TodoApi.Application.Common;
using TodoApi.Domain.Entities;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Application.CommandHandlers;

public class CreateTodoCommandHandler : ICommandHandler<CreateTodoCommand, Guid>
{
    private readonly ITodoRepository _repo;

    public CreateTodoCommandHandler(ITodoRepository repo)
    {
        _repo = repo;
    }

    public async Task<Guid> Handle(CreateTodoCommand command)
    {
        // Aynı istek tekrar geldiyse yeni kayıt açma, mevcudu döndür
        if (command.RequestId.HasValue)
        {
            var existing = await _repo.GetByRequestIdAsync(command.RequestId.Value);
            if (existing is not null) return existing.Id;
        }

        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = command.Title,
            Description = command.Description,
            DueDate = command.DueDate,
            RequestId = command.RequestId
        };

        await _repo.AddAsync(todo);
        await _repo.SaveChangesAsync();

        return todo.Id;
    }
}