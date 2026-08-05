namespace TodoApi.Application.DTOs;

// Profil bilgilerini döndürmek için
public record ProfileResponseDto(
    string DisplayName,
    string Email,
    string? PhotoBase64,
    bool EmailConfirmed
);

// Profil güncelleme isteği (DisplayName readonly, gönderilmez)
public class UpdateProfileDto
{
    public string Email { get; set; } = "";
    public string? PhotoBase64 { get; set; }
    public string? NewPassword { get; set; }      // opsiyonel — doluysa şifre değişir
    public string? CurrentPassword { get; set; }  // şifre değişikliği için gerekli
}