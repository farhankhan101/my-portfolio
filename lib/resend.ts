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
}

export async function sendContactEmail({ name, email, subject, message }: SendContactEmailParams) {
  const adminSubject = `New Contact from ${name} — ${subject}`
  const userSubject = `Got your message! I'll be in touch soon — Farhan Ahmed`

  const adminHtml = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #0369a1; border-bottom: 2px solid #f0f6ff; padding-bottom: 10px; margin-top: 0;">New Portfolio Message</h2>
      <p style="font-size: 16px; color: #334155; margin: 16px 0;"><strong>Name:</strong> ${name}</p>
      <p style="font-size: 16px; color: #334155; margin: 16px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0369a1; text-decoration: none;">${email}</a></p>
      <p style="font-size: 16px; color: #334155; margin: 16px 0;"><strong>Subject:</strong> ${subject}</p>
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
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">Senior Full Stack Developer</p>
            <p style="margin: 6px 0 0 0; font-size: 14px;">
              <a href="https://github.com/farhan-ahmed" style="color: #0369a1; text-decoration: none; margin-right: 12px;">GitHub</a>
              <a href="https://linkedin.com/in/farhan-ahmed" style="color: #0369a1; text-decoration: none;">LinkedIn</a>
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
      console.error('❌ Resend admin delivery error:', adminResult.error)
      throw new Error(adminResult.error.message)
    }

    return { success: true, adminMessageId: adminResult.data?.id, userMessageId: userResult.data?.id }
  } catch (error: any) {
    console.error('❌ Error sending emails via Resend:', error)
    throw error
  }
}
