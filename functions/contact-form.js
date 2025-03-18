// functions/contact-form.js
const sgMail = require('@sendgrid/mail');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);
    const { email, phone, company, message, contact_preference } = data;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Nieprawidłowy adres email' })
      };
    }

    // Konfiguracja SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Przygotowanie wiadomości
    const msg = {
      to: 'twoj@email.pl', // adres odbiorcy (Twój adres email)
      from: 'formularz@hyperautomate.pl', // zweryfikowany nadawca w SendGrid
      subject: 'Nowa wiadomość z formularza kontaktowego',
      text: `
        Email: ${email}
        Telefon: ${phone || 'Nie podano'}
        Firma: ${company || 'Nie podano'}
        Preferowany kontakt: ${contact_preference}
        Wiadomość: ${message || 'Brak wiadomości'}
      `,
      html: `
        <strong>Nowa wiadomość z formularza kontaktowego</strong><br><br>
        <b>Email:</b> ${email}<br>
        <b>Telefon:</b> ${phone || 'Nie podano'}<br>
        <b>Firma:</b> ${company || 'Nie podano'}<br>
        <b>Preferowany kontakt:</b> ${contact_preference}<br>
        <b>Wiadomość:</b> ${message || 'Brak wiadomości'}<br>
      `
    };
    
    // Wysłanie wiadomości
    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Wiadomość została wysłana' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Wystąpił błąd podczas przetwarzania żądania', 
        error: error.message 
      })
    };
  }
};
