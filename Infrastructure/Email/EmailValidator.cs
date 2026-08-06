using System.Net.Mail;
using DnsClient;
using TodoApi.Domain.Interfaces;

namespace TodoApi.Infrastructure.Email;

public class EmailValidator : IEmailValidator
{
    private readonly LookupClient _dns = new LookupClient();

    public async Task<bool> IsValidAsync(string email)
    {
        // 1. Format kontrolü
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            var addr = new MailAddress(email);
            if (addr.Address != email) return false;
        }
        catch
        {
            return false;
        }

        // 2. Alan adının gerçekten mail alıp almadığını kontrol et (MX kaydı)
        var domain = email.Split('@').Last();
        try
        {
            var mx = await _dns.QueryAsync(domain, QueryType.MX);
            if (mx.Answers.MxRecords().Any()) return true;

            // Bazı alanlar MX yerine A kaydıyla da mail alabilir
            var a = await _dns.QueryAsync(domain, QueryType.A);
            return a.Answers.ARecords().Any();
        }
        catch
        {
            return false; // DNS'e ulaşılamazsa güvenli tarafta kal
        }
    }
}