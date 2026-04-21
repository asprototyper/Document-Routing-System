// Server-side email templates. These must stay in sync with the preview
// strings in src/scripts.js (openEmailPrev). The server builds the final
// HTML itself so the client cannot inject arbitrary body content.

export const EMAIL_TYPES = new Set([
  'verify',
  'p3b_notify',
  'p6a_notify',
  'p6b_notify',
])

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @param {'verify'|'p3b_notify'|'p6a_notify'|'p6b_notify'} type
 * @param {{ entity?: string, contact?: string }} vars
 * @returns {{ subject: string, html: string }}
 */
export function buildEmail(type, vars = {}) {
  const entity = esc(vars.entity || 'the applicant')
  const contact = esc(vars.contact || entity)

  if (type === 'verify') {
    return {
      subject: 'Document Tracker — Email Verification',
      html:
        `Dear ${contact},<br><br>` +
        `This is a verification email from our Document Tracker system. ` +
        `Please confirm your email address is associated with your application.<br><br>` +
        `Thank you.`,
    }
  }

  if (type === 'p6a_notify') {
    return {
      subject: 'Document Tracker — Application Approved',
      html:
        `Dear ${contact} of ${entity},<br><br>` +
        `We are pleased to inform you that your application has been approved.<br><br>` +
        `Please find the attached Statement of Account with fees to be paid. ` +
        `Kindly settle the payment to proceed with certificate release.<br><br>` +
        `Thank you.`,
    }
  }

  if (type === 'p6b_notify') {
    return {
      subject: 'Document Tracker — Notice of Disapproval',
      html:
        `Dear ${contact} of ${entity},<br><br>` +
        `We regret to inform you that your application has been disapproved. ` +
        `Please refer to the attached Notice of Disapproval. Your application ` +
        `documents are being returned.<br><br>` +
        `Thank you.`,
    }
  }

  if (type === 'p3b_notify') {
    return {
      subject: 'Document Tracker — Notice of Deficiency',
      html:
        `Dear ${contact} of ${entity},<br><br>` +
        `We wish to inform you that upon evaluation of your application, a ` +
        `Notice of Deficiency has been issued.<br><br>` +
        `Your application has been found to have deficiencies that need to be ` +
        `addressed before processing can continue. Please coordinate with our ` +
        `office regarding the necessary requirements.<br><br>` +
        `Thank you.`,
    }
  }

  throw new Error(`Unknown email type: ${type}`)
}
