import dotenv from 'dotenv';
dotenv.config();

export async function sendConfirmationEmail(email: string, monthlySavings: number) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY is not set. Skipping email send.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SpendScope <onboarding@resend.dev>', // default Resend testing address
        to: email,
        subject: 'Your SpendScope AI Spend Audit Confirmation',
        html: `
          <h3>SpendScope Audit Confirmed</h3>
          <p>Thank you for using SpendScope. We have successfully recorded your AI spend audit.</p>
          <p><strong>Your Potential Monthly Savings:</strong> $${Number(monthlySavings).toFixed(2)}/month</p>
          ${
            monthlySavings >= 500
              ? `<p><strong>Note:</strong> Since your savings potential is high, a Credex consultant will reach out to you shortly to help optimize your stack and secure deep credits.</p>`
              : `<p>We will alert you if pricing models shift or if new optimization opportunities apply to your stack.</p>`
          }
          <p>Best regards,<br>The SpendScope Team</p>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email via Resend:', errorText);
    } else {
      console.log(`Confirmation email sent to ${email} successfully.`);
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}
