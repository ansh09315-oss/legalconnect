export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, email, phone, caseDetails, lawyerEmail, lawyerName } = data;

    // Use Web3Forms as the email provider based on existing frontend usage
    const web3formsAccessKey = Netlify.env.get('WEB3FORMS_ACCESS_KEY') || '60958c5b-9e33-4168-8cd8-4b276f2203f5';

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: web3formsAccessKey,
        subject: `New Case Request via LegalConnect: ${name}`,
        from_name: 'LegalConnect Portal',
        to_email: lawyerEmail,
        replyto: email,
        message: `
          New Case Request for ${lawyerName}
          
          Client Name: ${name}
          Client Phone: ${phone}
          Client Email: ${email}
          
          Case Details:
          ${caseDetails}
        `
      })
    });

    const result = await response.json();

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: 'Email sent directly to lawyer' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      throw new Error('Web3Forms API failed');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process email routing', details: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

export const config = {
  path: "/api/contact-lawyer"
};
