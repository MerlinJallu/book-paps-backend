import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CreateSupportMessageDto,
  SupportMessageType,
} from '../dto/create-support-message.dto';

export interface SupportMessageResponse {
  ok: true;
}

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subjectPrefix: string;
}

interface MailTransport {
  sendMail(options: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
}

interface NodemailerModule {
  createTransport(options: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }): MailTransport;
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_MESSAGES = 5;

const SUPPORT_MESSAGE_TYPE_LABELS: Record<SupportMessageType, string> = {
  [SupportMessageType.Bug]: 'Bug',
  [SupportMessageType.Idea]: 'Idée',
  [SupportMessageType.Question]: 'Question',
};

@Injectable()
export class SupportMessageService {
  private readonly rateLimitBuckets = new Map<string, RateLimitBucket>();

  async send(
    createSupportMessageDto: CreateSupportMessageDto,
    clientIp: string,
  ): Promise<SupportMessageResponse> {
    if (createSupportMessageDto.honeypot?.trim()) {
      return { ok: true };
    }

    this.assertRateLimit(clientIp);

    const smtpConfig = this.readSmtpConfig();
    const typeLabel = SUPPORT_MESSAGE_TYPE_LABELS[createSupportMessageDto.type];
    const subject = `${smtpConfig.subjectPrefix} ${typeLabel} — ${sanitizeSubject(createSupportMessageDto.subject)}`;

    try {
      const transport = this.createTransport(smtpConfig);

      await transport.sendMail({
        from: smtpConfig.from,
        to: smtpConfig.to,
        subject,
        text: createEmailText(createSupportMessageDto, typeLabel),
      });
    } catch (error) {
      console.error('Erreur lors de l’envoi du message support:', error);
      throw new InternalServerErrorException('Le message support n’a pas pu être envoyé');
    }

    return { ok: true };
  }

  private assertRateLimit(clientIp: string): void {
    const now = Date.now();
    const key = clientIp || 'unknown';
    const currentBucket = this.rateLimitBuckets.get(key);

    if (!currentBucket || now - currentBucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
      this.rateLimitBuckets.set(key, {
        count: 1,
        windowStart: now,
      });
      return;
    }

    if (currentBucket.count >= RATE_LIMIT_MAX_MESSAGES) {
      throw new HttpException(
        'Trop de messages envoyés. Veuillez réessayer plus tard.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    currentBucket.count += 1;
  }

  private readSmtpConfig(): SmtpConfig {
    const requiredVariables = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM',
      'SUPPORT_MESSAGE_TO',
    ];
    const missingVariables = requiredVariables.filter(
      (variableName) => !process.env[variableName]?.trim(),
    );
    const port = Number(process.env.SMTP_PORT);

    if (missingVariables.length || !Number.isInteger(port) || port <= 0) {
      console.error(
        'Configuration SMTP support-message incomplète:',
        missingVariables.length ? missingVariables.join(', ') : 'SMTP_PORT invalide',
      );
      throw new InternalServerErrorException('Configuration SMTP incomplète');
    }

    return {
      host: process.env.SMTP_HOST.trim(),
      port,
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM.trim(),
      to: process.env.SUPPORT_MESSAGE_TO.trim(),
      subjectPrefix: process.env.SUPPORT_MESSAGE_SUBJECT_PREFIX?.trim() || '[BookPaps]',
    };
  }

  private createTransport(smtpConfig: SmtpConfig): MailTransport {
    const nodemailer = require('nodemailer') as NodemailerModule;

    return nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });
  }
}

function createEmailText(
  createSupportMessageDto: CreateSupportMessageDto,
  typeLabel: string,
): string {
  return [
    'Nouveau message depuis l’admin BookPaps.',
    '',
    `Type : ${typeLabel}`,
    `Sujet : ${createSupportMessageDto.subject}`,
    `Page concernée : ${createSupportMessageDto.pageUrl || 'Non renseignée'}`,
    `Date serveur : ${new Date().toISOString()}`,
    '',
    'Message :',
    createSupportMessageDto.message,
  ].join('\n');
}

function sanitizeSubject(subject: string): string {
  return subject.replace(/[\r\n]+/g, ' ').trim().slice(0, 120);
}
