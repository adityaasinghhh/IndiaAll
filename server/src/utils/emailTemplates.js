export function escapeHtml(value = '') {
  return String(value).replace(/[&<>\"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;',
  })[character])
}

export function enquiryNotificationEmail(enquiry) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #202328; padding: 24px; text-align: center;">
        <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <h2 style="color: #292D32; margin-top: 0;">New Enquiry Received</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Name:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.name || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Company:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.company || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Email:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.email || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Phone:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.phone || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Commodity:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.commodity || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Quantity:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.quantity || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Enquiry Type:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.enquiryType || 'N/A')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Delivery Location:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.deliveryLocation || '')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Country:</td>
            <td style="padding: 8px 0;">${escapeHtml(enquiry.country || 'N/A')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #292D32;">Message:</td>
            <td style="padding: 8px 0;">${enquiry.message ? escapeHtml(enquiry.message) : 'N/A'}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Submitted on: ${new Date(enquiry.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  `
}

export function bulkOrderNotificationEmail(order) {
  const rows = [
    ['Full name', order.fullName],
    ['Company', order.company],
    ['Email', order.email],
    ['Phone', order.phone || 'N/A'],
    ['Country', order.country],
    ['Commodity', order.commodity === 'other' ? `Other — ${order.otherCommodity}` : order.commodity],
    ['Quantity', `${order.quantity} ${order.unit}`],
    ['Destination', order.destination],
    ['Packaging', order.packaging || 'N/A'],
    ['Quality / grade', order.grade || 'N/A'],
    ['Delivery timeframe', order.deliveryTimeframe || 'N/A'],
    ['Incoterms', order.incoterms || 'N/A'],
    ['Target price / budget', order.targetPrice || 'N/A'],
    ['Reference', order.reference || 'N/A'],
    ['Additional requirements', order.message || 'N/A'],
  ]

  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B1F3A; padding: 24px; text-align: center;">
        <h1 style="color: #C9A24B; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <h2 style="color: #292D32; margin-top: 0;">New Custom Bulk Order Request</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${rows.map(([label, value]) => `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #292D32; vertical-align: top; width: 40%;">${label}:</td>
              <td style="padding: 8px 0;">${escapeHtml(value || '')}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Submitted on: ${new Date(order.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  `
}

export function bulkOrderAutoReplyEmail(order, lang = 'en') {
  const messages = {
    en: {
      greeting: `Dear ${escapeHtml(order.fullName || '')},`,
      body: 'Thank you for your custom bulk order request. We have received your requirements and our team will review them shortly. We will contact you to discuss sourcing options and commercial terms.',
      closing: 'Best regards,',
      company: 'INDIA ALL',
    },
    es: {
      greeting: `Estimado/a ${escapeHtml(order.fullName || '')},`,
      body: 'Gracias por su solicitud de pedido al por mayor personalizado. Hemos recibido sus requisitos y nuestro equipo los revisará en breve. Nos pondremos en contacto con usted para discutir opciones de abastecimiento y términos comerciales.',
      closing: 'Saludos cordiales,',
      company: 'INDIA ALL',
    },
    pt: {
      greeting: `Prezado/a ${escapeHtml(order.fullName || '')},`,
      body: 'Obrigado pelo seu pedido personalizado em grande quantidade. Recebemos os seus requisitos e nossa equipe irá analisá-los em breve. Entraremos em contato para discutir opções de fornecimento e termos comerciais.',
      closing: 'Atenciosamente,',
      company: 'INDIA ALL',
    },
  }

  const msg = messages[lang] || messages.en

  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B1F3A; padding: 24px; text-align: center;">
        <h1 style="color: #C9A24B; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <p>${msg.greeting}</p>
        <p>${msg.body}</p>
        <p>${msg.closing}<br><strong>${msg.company}</strong></p>
        <hr style="border: none; border-top: 1px solid #C5C9C8; margin: 24px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    </div>
  `
}

export function enquiryAutoReplyEmail(enquiry, lang = 'en') {
  const messages = {
    en: {
      greeting: `Dear ${escapeHtml(enquiry.name || '')},`,
      body: 'Thank you for your enquiry. We have received your request and our team will review it shortly. We will get back to you within 24 hours with a response.',
      closing: 'Best regards,',
      company: 'INDIA ALL',
    },
    es: {
      greeting: `Estimado/a ${escapeHtml(enquiry.name || '')},`,
      body: 'Gracias por su consulta. Hemos recibido su solicitud y nuestro equipo la revisará en breve. Nos pondremos en contacto con usted dentro de 24 horas con una respuesta.',
      closing: 'Saludos cordiales,',
      company: 'INDIA ALL',
    },
    pt: {
      greeting: `Prezado/a ${escapeHtml(enquiry.name || '')},`,
      body: 'Obrigado pela sua consulta. Recebemos o seu pedido e nossa equipe irá analisá-lo em breve. Entraremos em contato dentro de 24 horas com uma resposta.',
      closing: 'Atenciosamente,',
      company: 'INDIA ALL',
    },
  }

  const msg = messages[lang] || messages.en

  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #202328; padding: 24px; text-align: center;">
        <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <p>${msg.greeting}</p>
        <p>${msg.body}</p>
        <p>${msg.closing}<br><strong>${msg.company}</strong></p>
        <hr style="border: none; border-top: 1px solid #C5C9C8; margin: 24px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated response. Please do not reply to this email.
        </p>
      </div>
    </div>
  `
}

export function statusUpdateEmail(enquiry, lang = 'en') {
  const messages = {
    en: {
      greeting: `Dear ${escapeHtml(enquiry.name || '')},`,
      body: `The status of your enquiry for <strong>${escapeHtml(enquiry.commodity || '')}</strong> has been updated to: <strong>${enquiry.status}</strong>.`,
      closing: 'Best regards,',
      company: 'INDIA ALL',
    },
    es: {
      greeting: `Estimado/a ${escapeHtml(enquiry.name || '')},`,
      body: `El estado de su consulta para <strong>${escapeHtml(enquiry.commodity || '')}</strong> ha sido actualizado a: <strong>${enquiry.status}</strong>.`,
      closing: 'Saludos cordiales,',
      company: 'INDIA ALL',
    },
    pt: {
      greeting: `Prezado/a ${escapeHtml(enquiry.name || '')},`,
      body: `O status da sua consulta para <strong>${escapeHtml(enquiry.commodity || '')}</strong> foi atualizado para: <strong>${enquiry.status}</strong>.`,
      closing: 'Atenciosamente,',
      company: 'INDIA ALL',
    },
  }

  const msg = messages[lang] || messages.en

  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #202328; padding: 24px; text-align: center;">
        <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <p>${msg.greeting}</p>
        <p>${msg.body}</p>
        <p>${msg.closing}<br><strong>${msg.company}</strong></p>
      </div>
    </div>
  `
}

export function emailOtpEmail(name, code, purpose) {
  const heading =
    purpose === 'admin-login'
      ? 'Your administrator sign-in code'
      : purpose === 'password'
        ? 'Your password code'
        : 'Your email verification code'

  const instructions =
    purpose === 'admin-login'
      ? 'Use this code together with your administrator password to finish signing in.'
      : purpose === 'password'
        ? 'Use this code to continue the password reset or password change.'
        : 'Use this code to verify your email address.'

  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #202328; padding: 24px; text-align: center;">
        <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <p>Dear ${name},</p>
        <h2 style="color: #292D32; margin-top: 0;">${heading}</h2>
        <p>${instructions}</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #292D32;">${code}</div>
        </div>
        <p style="color: #666; font-size: 12px;">
          This code expires in 5 minutes and can only be used once. Please do not share it.
        </p>
      </div>
    </div>
  `
}

export function passwordResetEmail(name, resetUrl) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #202328; padding: 24px; text-align: center;">
        <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
      </div>
      <div style="padding: 32px; background: #F3F2EE;">
        <p>Dear ${name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #326783; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
      </div>
    </div>
  `
}
