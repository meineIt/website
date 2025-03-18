// functions/subscribe-ebook.js
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
    const email = data.email;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          message: 'Nieprawidłowy adres email' 
        })
      };
    }
    
    // Token API jest przechowywany w zmiennych środowiskowych Netlify
    const MAILERLITE_API_TOKEN = process.env.MAILERLITE_API_TOKEN;
    
    // Zapytanie do API MailerLite
    const response = await axios.post(
      'https://api.mailerlite.com/api/v2/subscribers',
      {
        email: email,
        // Możesz dodać dodatkowe pola jeśli potrzebujesz
        name: '', // Opcjonalnie, jeśli zbierasz imię
        fields: {
          // Dodatkowe pola, np. oznaczenie źródła
          source: 'ebook-automation'
        },
        // ID grupy MailerLite, do której ma być dodany subskrybent (e-book)
        groups: [process.env.MAILERLITE_EBOOK_GROUP_ID]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': MAILERLITE_API_TOKEN
        }
      }
    );

    // Jeśli masz przygotowany e-book do bezpośredniego pobrania,
    // możesz zwrócić URL do niego:
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Subskrypcja zakończona pomyślnie',
        downloadUrl: process.env.EBOOK_DOWNLOAD_URL || null
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
