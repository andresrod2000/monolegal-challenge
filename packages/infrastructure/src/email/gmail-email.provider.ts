import nodemailer from 'nodemailer';
import type { EmailMessage, IEmailProvider } from '@monolegal/domain';
import type { ILogger } from '@monolegal/domain';

export interface GmailEmailProviderConfig {
  user: string;
  appPassword: string;
}

export class GmailEmailProvider implements IEmailProvider {
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;

  constructor(
    config: GmailEmailProviderConfig,
    private readonly logger: ILogger,
  ) {
    this.fromAddress = config.user;
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.user,
        pass: config.appPassword,
      },
    });
  }

  async sendReminder(message: EmailMessage): Promise<void> {
    const info = await this.transporter.sendMail({
      from: `"Monolegal Facturación" <${this.fromAddress}>`,
      to: message.to,
      subject: message.subject,
      text: message.body,
    });

    this.logger.info('Email sent via Gmail SMTP', {
      to: message.to,
      subject: message.subject,
      messageId: info.messageId,
    });
  }
}
