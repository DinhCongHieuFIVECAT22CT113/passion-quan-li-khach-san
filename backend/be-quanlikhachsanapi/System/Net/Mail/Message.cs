using System.Net.Mail;

namespace be_quanlikhachsanapi.System.Net.Mail
{
    public class Message
    {
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public MailAddress? From { get; set; }
    }
}
