using System.Net.Mail;
using System.Net;

namespace be_quanlikhachsanapi.Helpers
{
    public class MailHelper
    {
        private IConfiguration _confEmail;
        public MailHelper(IConfiguration confEmail)
        {
            _confEmail = confEmail;
        }
        public bool Send(string from, string to, string subject, string content)
        {
            try
            {
                var host = _confEmail["Gmail:Host"];
                var port = int.Parse(_confEmail["Gmail:Port"]);
                var username = _confEmail["Gmail:Username"];
                var password = _confEmail["Gmail:Password"];
                var enable = bool.Parse(_confEmail["Gmail:SMTP:starttls:enable"]);

                var smtpClient = new SmtpClient
                {
                    Host = host,
                    Port = port,
                    EnableSsl = enable,
                    Credentials = new NetworkCredential(username, password)
                };

                var mailMessage = new MailMessage(from, to);
                mailMessage.Subject = subject;
                mailMessage.Body = content;
                mailMessage.IsBodyHtml = true;

                smtpClient.Send(mailMessage);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}