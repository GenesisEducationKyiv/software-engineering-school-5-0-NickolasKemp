import { EmailTemplate } from '@notification-sender/application-services/types/email.interface';

export abstract class AbstractEmailSender {
  abstract sendEmail(to: string, template: EmailTemplate): Promise<void>;
}
