import type { EmailMessage, IEmailProvider } from '@monolegal/domain';
import type { ILogger } from '@monolegal/domain';

export class MockEmailProvider implements IEmailProvider {
  constructor(private readonly logger: ILogger) {}

  async sendReminder(message: EmailMessage): Promise<void> {
    this.logger.info('Mock email sent', {
      to: message.to,
      subject: message.subject,
      bodyPreview: message.body.slice(0, 100),
    });
  }
}
