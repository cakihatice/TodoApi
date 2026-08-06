namespace TodoApi.Domain.Interfaces;

public interface IEmailValidator
{
    Task<bool> IsValidAsync(string email);
}
