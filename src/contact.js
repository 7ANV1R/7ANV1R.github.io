// The site's one contact pipe (formsubmit.co), shared by the Get in touch
// section and destroy mode's "Say hi" dialog.
export const CONTACT_EMAIL = 'tanvir.inquiries@gmail.com';

export async function sendContact({ name, email, message }) {
  const data = new FormData();
  data.append('name', name.trim());
  data.append('email', email.trim());
  data.append('message', message.trim());
  data.append('_honey', '');
  data.append('_captcha', 'false');
  const res = await fetch(`https://formsubmit.co/${CONTACT_EMAIL}`, {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Form submission failed');
}
