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
      to: 'itmeine@gmail.com', // WAŻNE: Zmień na swój adres email!
      from: 'hubertus-1974@o2.pl', // Zmień na zweryfikowany adres email w SendGrid
      subject: 'Nowa wiadomość z formularza kontaktowego - hyperautomate.pl',
      text: `
        Otrzymałeś nową wiadomość z formularza kontaktowego:
        
        Email: ${email}
        Telefon: ${phone || 'Nie podano'}
        Firma: ${company || 'Nie podano'}
        Preferowany kontakt: ${contact_preference}
        
        Wiadomość:
        ${message || 'Brak wiadomości'}
      `,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p>Otrzymałeś nową wiadomość z formularza kontaktowego na stronie hyperautomate.pl:</p>
        <table border="0" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td><strong>Email:</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Telefon:</strong></td>
            <td>${phone || 'Nie podano'}</td>
          </tr>
          <tr>
            <td><strong>Firma:</strong></td>
            <td>${company || 'Nie podano'}</td>
          </tr>
          <tr>
            <td><strong>Preferowany kontakt:</strong></td>
            <td>${contact_preference}</td>
          </tr>
        </table>
        <h3>Wiadomość:</h3>
        <p>${message ? message.replace(/\n/g, '<br>') : 'Brak wiadomości'}</p>
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
