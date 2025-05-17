using be_quanlikhachsanapi.ViewModel;
using System.Net.Mail;
using System.Net;

namespace be_quanlikhachsanapi.Services
{
     public interface ISendEmailServices
    {
        bool SendEmail(EmailModel email);
    }
    public class SendEmailServices : ISendEmailServices
    {
        public string username;
        public string password;
        private IConfiguration _confEmail;

        public SendEmailServices(IConfiguration confEmail)
        {
            _confEmail = confEmail;

            username = _confEmail["Gmail:Username"];
            password = _confEmail["Gmail:Password"];
        }
        public bool SendEmail(EmailModel email) 
        {
            try
            {
                var smtpClient = new SmtpClient
                {
                    Host = _confEmail["Gmail:Host"],
                    Port = int.Parse(_confEmail["Gmail:Port"]),
                    EnableSsl = bool.Parse(_confEmail["Gmail:SMTP:starttls:enable"]),
                    Credentials = new NetworkCredential(username, password)
                };

                var mailMessage = new MailMessage(username, email.ToEmail);
                mailMessage.Subject = email.Subject;
                mailMessage.Body = email.Body;
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