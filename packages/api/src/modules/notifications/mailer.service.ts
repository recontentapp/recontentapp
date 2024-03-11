import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as ejs from 'ejs'
import * as fs from 'fs'
import { Transporter, createTransport } from 'nodemailer'
import * as path from 'path'

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

  constructor() {
    this.transporter = createTransport({
      host: process.env.MAILER_HOST,
      port: Number(process.env.MAILER_PORT),
      secure: process.env.MAILER_SECURE === 'true',
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
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
        from: from ?? process.env.MAILER_FROM_EMAIL,
        to,
        subject,
        html,
      })
    } catch (e) {
      throw new InternalServerErrorException('Could not send email')
    }
  }
}
