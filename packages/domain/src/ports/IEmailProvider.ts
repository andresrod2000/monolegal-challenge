export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface IEmailProvider {
  sendReminder(message: EmailMessage): Promise<void>;
}
