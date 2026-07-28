using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Application.Commands;
using TodoApi.Application.Common;
using TodoApi.Application.DTOs;
using TodoApi.Application.Queries;

namespace TodoApi.Application.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodoController : ControllerBase
{
    private readonly ICommandHandler<CreateTodoCommand, Guid> _createHandler;
    private readonly ICommandHandler<UpdateTodoCommand, bool> _updateHandler;
    private readonly ICommandHandler<DeleteTodoCommand, bool> _deleteHandler;
    private readonly IQueryHandler<GetAllTodosQuery, List<TodoDto>> _getAllHandler;
    private readonly IQueryHandler<GetTodoByIdQuery, TodoDto?> _getByIdHandler;

    public TodoController(
        ICommandHandler<CreateTodoCommand, Guid> createHandler,
        ICommandHandler<UpdateTodoCommand, bool> updateHandler,
        ICommandHandler<DeleteTodoCommand, bool> deleteHandler,
        IQueryHandler<GetAllTodosQuery, List<TodoDto>> getAllHandler,
        IQueryHandler<GetTodoByIdQuery, TodoDto?> getByIdHandler)
    {
        _createHandler = createHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getAllHandler = getAllHandler;
        _getByIdHandler = getByIdHandler;
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoDto>>> GetAll()
    {
        var result = await _getAllHandler.Handle(new GetAllTodosQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoDto>> GetById(Guid id)
    {
        var result = await _getByIdHandler.Handle(new GetTodoByIdQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTodoCommand command)
    {
        var id = await _createHandler.Handle(command);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTodoCommand command)
    {
        if (id != command.Id) return BadRequest();
        var success = await _updateHandler.Handle(command);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _deleteHandler.Handle(new DeleteTodoCommand(id));
        return success ? NoContent() : NotFound();
    }
}