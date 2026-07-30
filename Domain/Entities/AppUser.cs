using Microsoft.AspNetCore.Identity;

namespace TodoApi.Domain.Entities;

public class AppUser : IdentityUser
{
    public string DisplayName { get; set; } = "";
}