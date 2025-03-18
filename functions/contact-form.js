// functions/contact-form.js
const axios = require('axios');

exports.handler = async function(event, context) {
  // Zapewniamy, że metoda to POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // Parsowanie danych z zapytania
    const data = JSON.parse(event.body);
    const { email, phone, company, message, contact_preference } = data;
    
    // Podstawowa walidacja
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: 'Nieprawidłowy adres email' 
        })
      };
    }

    // Weryfikacja tokenu CSRF (jeśli używasz) 
    const csrfToken = event.headers['x-csrf-token'];
    // Tu powinno być dodatkowe sprawdzenie tokenu CSRF

    // Token API EmailJS jest przechowywany w zmiennych środowiskowych
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID;
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    
    // Zapytanie do EmailJS
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        user_id: EMAILJS_USER_ID,
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        template_params: {
          email: email,
          phone: phone || 'Nie podano',
          company: company || 'Nie podano',
          message: message || 'Brak wiadomości',
          contact_preference: contact_preference
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Wiadomość została wysłana' 
      })
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
