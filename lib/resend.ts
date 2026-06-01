// lib/resend.ts
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@farhan.dev'
const contactEmail = process.env.CONTACT_TO_EMAIL || 'farhan@silquetech.com'

const resend = resendApiKey && !resendApiKey.includes('yourResendAPIKey') 
  ? new Resend(resendApiKey) 
  : null

interface SendContactEmailParams {
  name: string
  email: string
  subject: string
  message: string
  phone?: string | null
  attachmentName?: string | null
  attachmentData?: string | null
}

export async function sendContactEmail({ name, email, subject, message, phone, attachmentName, attachmentData }: SendContactEmailParams) {
  const adminSubject = `New Contact from ${name} — ${subject}`
  const userSubject = `Got your message! I'll be in touch soon — Farhan Ahmed`

  const adminHtml = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #0369a1; border-bottom: 2px solid #f0f6ff; padding-bottom: 10px; margin-top: 0;">New Portfolio Message</h2>
      <p style="font-size: 16px; color: #334155; margin: 12px 0;"><strong>Name:</strong> ${name}</p>
      <p style="font-size: 16px; color: #334155; margin: 12px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0369a1; text-decoration: none;">${email}</a></p>
      ${phone ? `<p style="font-size: 16px; color: #334155; margin: 12px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
      <p style="font-size: 16px; color: #334155; margin: 12px 0;"><strong>Subject:</strong> ${subject}</p>
      ${attachmentName ? `<p style="font-size: 16px; color: #334155; margin: 12px 0;"><strong>Attachment:</strong> ${attachmentName}</p>` : ''}
      <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid #0369a1; border-radius: 4px; font-style: italic; color: #475569; line-height: 1.6;">
        "${message.replace(/\n/g, '<br/>')}"
      </div>
      <a href="mailto:${email}" style="display: inline-block; background-color: #0369a1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">Reply to ${name}</a>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Received via farhan.dev contact form</p>
    </div>
  `

  const userHtml = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #0369a1; margin-top: 0;">Hi ${name},</h2>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        Thank you for reaching out! I've received your message regarding <strong>"${subject}"</strong>.
      </p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        I typically review my messages and respond within 24 hours.
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f0f9ff; border-radius: 6px;">
        <p style="margin: 0; font-size: 15px; color: #0369a1; font-weight: 500;">
          While you wait, feel free to view my recent case studies:
        </p>
        <p style="margin: 8px 0 0 0; font-size: 15px;">
          <a href="https://farhan.dev/projects" style="color: #0284c7; text-decoration: underline; font-weight: 600;">Check out my latest projects →</a>
        </p>
      </div>
      <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
        Talk soon,
      </p>
      <table style="width: 100%; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        <tr>
          <td style="vertical-align: top;">
            <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 16px;">Farhan Ahmed</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">Full Stack Developer</p>
            <p style="margin: 6px 0 0 0; font-size: 14px;">
              <a href="https://github.com/farhankhan101" style="color: #0369a1; text-decoration: none; margin-right: 12px;">GitHub</a>
              <a href="https://www.linkedin.com/mynetwork/grow/" style="color: #0369a1; text-decoration: none;">LinkedIn</a>
            </p>
          </td>
        </tr>
      </table>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
        You are receiving this automated confirmation because you submitted a contact request at farhan.dev.
      </p>
    </div>
  `

  if (!resend) {
    console.warn('⚠️ [Resend SDK Sandbox] Resend API key is missing or dummy. Logging email outputs to console:')
    console.log(`[To Admin: ${contactEmail}] [Subject: ${adminSubject}]`)
    console.log(`[To Sender: ${email}] [Subject: ${userSubject}]`)
    return { success: true, sandbox: true }
  }

  try {
    // Send to Admin
    const adminMailPromise = resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      subject: adminSubject,
      html: adminHtml,
      replyTo: email,
      attachments: attachmentName && attachmentData ? [
        {
          filename: attachmentName,
          content: attachmentData,
        }
      ] : undefined
    })

    // Send Auto-reply to User
    const userMailPromise = resend.emails.send({
      from: fromEmail,
      to: email,
      subject: userSubject,
      html: userHtml,
    })

    const [adminResult, userResult] = await Promise.all([adminMailPromise, userMailPromise])
    
    if (adminResult.error) {
      console.warn('⚠️ Resend admin delivery error:', adminResult.error.message)
      console.log(`[LOCAL CONTACT LOGGER] Name: ${name}, Email: ${email}, Subject: ${subject}, Message: ${message}`)
      return { success: true, sandbox: true, error: adminResult.error.message }
    }

    return { success: true, adminMessageId: adminResult.data?.id, userMessageId: userResult.data?.id }
  } catch (error: any) {
    console.warn('⚠️ Resend delivery failed. Logging contact details to console:')
    console.log(`[LOCAL CONTACT LOGGER] Name: ${name}, Email: ${email}, Subject: ${subject}, Message: ${message}`)
    return { success: true, sandbox: true, error: error.message }
  }
}

interface SendVerificationCodeParams {
  email: string
  code: string
}

export async function sendVerificationCodeEmail({ email, code }: SendVerificationCodeParams) {
  const subject = `Your Review Verification Code — Farhan Ahmed`
  const html = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #0369a1; border-bottom: 2px solid #f0f6ff; padding-bottom: 10px; margin-top: 0;">Verification Code</h2>
      <p style="font-size: 16px; color: #334155; margin: 12px 0;">Hello,</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        You requested a verification code to leave a review on Farhan Ahmed's engineering portfolio.
      </p>
      <div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border: 1px dashed #0284c7; border-radius: 8px; text-align: center;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0369a1;">${code}</span>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Sent via farhan.dev authentication service</p>
    </div>
  `

  if (!resend) {
    console.warn('⚠️ [Resend SDK Sandbox] Resend API key is missing or dummy. Logging verification code to console:')
    console.log(`[To: ${email}] [Verification Code: ${code}]`)
    return { success: true, sandbox: true }
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: subject,
      html: html,
    })

    if (result.error) {
      console.warn('⚠️ Resend verification delivery failed (sandbox or domain verification error). Falling back to console logger:')
      console.log(`[LOCAL DEV CODE LOGGER] Verification code for ${email} is: ${code}`)
      return { success: true, sandbox: true, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error: any) {
    console.warn('⚠️ Resend verification delivery failed. Falling back to console logger:')
    console.log(`[LOCAL DEV CODE LOGGER] Verification code for ${email} is: ${code}`)
    return { success: true, sandbox: true, error: error.message }
  }
}
