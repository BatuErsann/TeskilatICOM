const sendEmail = require('../utils/email');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email and message',
      });
    }

    const formType = type === 'join' ? 'Join The Team Application' : 'Contact Form Submission';
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New ${formType}</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          <p><strong>Message:</strong></p>
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">This email was sent from the Teskilat website contact form.</p>
      </div>
    `;

    await sendEmail({
      email: process.env.CONTACT_EMAIL_RECIPIENT || 'info@teskilat.com.tr',
      subject: `${formType}: ${subject || 'No Subject'} - ${name}`,
      message: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: emailContent,
    });

    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully!',
    });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({
      status: 'error',
      message: 'There was an error sending the email. Please try again later.',
    });
  }
};
