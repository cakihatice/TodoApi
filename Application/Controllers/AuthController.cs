using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi.Application.DTOs;
using TodoApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using TodoApi.Domain.Interfaces;
using System.Net;


namespace TodoApi.Application.Controllers
{
    [ApiController]
    [Route("api/auth")]
    
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly IEmailValidator _emailValidator;

        public AuthController(
            UserManager<AppUser> userManager,
            IConfiguration configuration,
            IEmailSender emailSender,
            IEmailValidator emailValidator)
        {
            _userManager = userManager;
            _configuration = configuration;
            _emailSender = emailSender;
            _emailValidator = emailValidator;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (!await _emailValidator.IsValidAsync(dto.Email))
    {
            return BadRequest(new { message = "Geçerli ve var olan bir e-posta adresi girin." });
    }
            var existing = await _userManager.Users
            .FirstOrDefaultAsync(u => u.DisplayName == dto.DisplayName);
            if (existing != null)
    {
        return BadRequest(new { message = "Bu kullanıcı adı zaten alınmış." });
    }
            var user = new AppUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                DisplayName = dto.DisplayName
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
                }
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebUtility.UrlEncode(token);
                var confirmLink = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

                await _emailSender.SendAsync(
                    user.Email!,
                    "Do'ty uygulamasına hoş geldiniz! 🎉",
                    BuildWelcomeEmail(user.DisplayName,confirmLink));
                    return Ok(new { message = "Kullanıcı başarıyla oluşturuldu." });
                    }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized(new { message = "Email veya şifre hatalı." });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, displayName = user.DisplayName });
        }

        private string GenerateJwtToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
private static string BuildWelcomeEmail(string displayName, string confirmLink)
{
    return $@"
<div style='font-family: Outfit, Arial, sans-serif; max-width: 480px; margin: 0 auto;
            border: 1px solid #eee; border-radius: 12px; overflow: hidden;'>
  <div style='background: linear-gradient(135deg, #667eea, #764ba2);
              padding: 32px; text-align: center;'>
    <div style='font-size: 40px; font-weight: 700; color: #fff; letter-spacing: 1px;'>
      Do<span style='color:#22b573;'>&#10003;</span>ty
    </div>
  </div>
  <div style='padding: 32px; color: #333;'>
    <h2 style='margin-top: 0;'>Hoş geldin, {displayName}! 👋</h2>
    <p>Do'ty ailesine katıldığın için teşekkürler. Hesabını etkinleştirmek için
       e-posta adresini doğrula:</p>
    <p style='text-align: center; margin: 28px 0;'>
      <a href='{confirmLink}'
         style='background: #667eea; color: #fff; text-decoration: none;
                padding: 12px 28px; border-radius: 8px; font-weight: 600;'>
         E-postamı Doğrula
      </a>
    </p>
    <p style='color: #999; font-size: 12px; word-break: break-all;'>
       Buton çalışmazsa bu linki tarayıcına yapıştır:<br>{confirmLink}
    </p>
    <p style='color: #999; font-size: 13px; margin-top: 32px;'>— Do'ty ekibi</p>
  </div>
</div>";
}
[HttpGet("confirm-email")]
public async Task<IActionResult> ConfirmEmail(string userId, string token)
{
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null)
        return NotFound(new { message = "Kullanıcı bulunamadı." });

    var decodedToken = WebUtility.UrlDecode(token);
    var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
    if (!result.Succeeded)
        return BadRequest(new { message = "E-posta doğrulama başarısız veya link geçersiz." });

    return Ok(new { message = "E-posta başarıyla doğrulandı! Artık giriş yapabilirsin." });
}
[Authorize]
[HttpGet("me")]
public async Task<IActionResult> GetProfile()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (userId == null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) return NotFound();

    return Ok(new ProfileResponseDto(
        user.DisplayName,
        user.Email!,
        user.PhotoBase64,
        user.EmailConfirmed
    ));
}

[Authorize]
[HttpPut("profile")]
public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (userId == null) return Unauthorized();

    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) return NotFound();

    // E-posta değişikliği
    if (!string.IsNullOrWhiteSpace(dto.Email) &&
        !string.Equals(dto.Email, user.Email, StringComparison.OrdinalIgnoreCase))
    {
        var emailTaken = await _userManager.FindByEmailAsync(dto.Email);
        if (emailTaken != null && emailTaken.Id != user.Id)
            return BadRequest(new { message = "Bu e-posta zaten kullanımda." });

        user.Email = dto.Email;
        user.UserName = dto.Email;
        user.EmailConfirmed = false; // yeni e-posta yeniden doğrulanmalı
    }

    // Fotoğraf (base64) güncelleme
    if (dto.PhotoBase64 != null)
    {
        user.PhotoBase64 = dto.PhotoBase64;
    }

    var updateResult = await _userManager.UpdateAsync(user);
    if (!updateResult.Succeeded)
        return BadRequest(updateResult.Errors);

    // Şifre değişikliği (opsiyonel)
    if (!string.IsNullOrWhiteSpace(dto.NewPassword))
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            return BadRequest(new { message = "Mevcut şifre gerekli." });

        var pwResult = await _userManager.ChangePasswordAsync(
            user, dto.CurrentPassword, dto.NewPassword);
        if (!pwResult.Succeeded)
            return BadRequest(pwResult.Errors);
    }

    return Ok(new { message = "Profil güncellendi." });
}
    }
}