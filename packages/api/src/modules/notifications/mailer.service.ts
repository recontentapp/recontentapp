import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as ejs from 'ejs'
import * as fs from 'fs'
import { Transporter, createTransport } from 'nodemailer'
import * as path from 'path'
import { Config } from 'src/utils/config'

interface TemplateOptions {
  name: string
  params: {
    /**
     * @default process.env.MAILER_FROM_EMAIL
     */
    from?: string
    to: string
    subject: string
  }
}

interface ConfirmationCodeTemplateOptions extends TemplateOptions {
  name: 'confirmation-code'
  data: {
    confirmationCode: string
  }
}

interface InvitationTemplateOptions extends TemplateOptions {
  name: 'invitation'
  data: {
    invitationCode: string
    inviterName: string
    inviterEmail: string
  }
}

type Params = ConfirmationCodeTemplateOptions | InvitationTemplateOptions

@Injectable()
export class MailerService {
  private transporter: Transporter

  private static templatesFolder = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'email-templates',
    'dist',
  )

  constructor(private readonly configService: ConfigService<Config>) {
    const config = this.configService.get('mailer', { infer: true })

    this.transporter = createTransport({
      host: config?.host,
      port: config?.port,
      secure: config?.secure,
      auth: {
        user: config?.user,
        pass: config?.password,
      },
    })
  }

  private renderTemplate(templateName: string, data: unknown) {
    try {
      const templateContent = fs.readFileSync(
        path.join(MailerService.templatesFolder, `${templateName}.html`),
        'utf8',
      )

      const template = ejs.compile(templateContent)
      return template(data as ejs.Data)
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async sendEmail(params: Params) {
    const html = this.renderTemplate(params.name, params.data)
    if (!html) {
      throw new InternalServerErrorException('Could not render email template')
    }

    const { from, to, subject } = params.params

    try {
      await this.transporter.sendMail({
        from:
          from ?? this.configService.get('mailer.fromEmail', { infer: true }),
        to,
        subject,
        html,
      })
    } catch (e) {
      throw new InternalServerErrorException('Could not send email')
    }
  }
}
