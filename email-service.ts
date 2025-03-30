import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email notification
 * @param options Email options
 * @returns Whether the email was sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In a production environment, use environment variables for these settings
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASSWORD || 'password',
      },
    };

    // Create a transporter
    const transporter = nodemailer.createTransport(smtpConfig);

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Delta Flight Tracker <notifications@deltaflighttracker.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || `<p>${options.text}</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a price drop notification email
 * @param to Recipient email address
 * @param flightDetails Flight details
 * @returns Whether the email was sent successfully
 */
export async function sendPriceDropEmail(
  to: string,
  flightDetails: {
    airline: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
    originalPrice: number;
    newPrice: number;
    priceDifference: number;
  }
): Promise<boolean> {
  const subject = `Price Drop Alert: ${flightDetails.airline} ${flightDetails.flightNumber}`;
  
  const text = `
    Good news! We've detected a price drop for your flight.
    
    Flight: ${flightDetails.airline} ${flightDetails.flightNumber}
    Route: ${flightDetails.departureAirport} to ${flightDetails.arrivalAirport}
    Date: ${new Date(flightDetails.departureDate).toLocaleDateString()}
    
    Original Price: $${flightDetails.originalPrice.toFixed(2)}
    Current Price: $${flightDetails.newPrice.toFixed(2)}
    Savings: $${flightDetails.priceDifference.toFixed(2)}
    
    We're automatically requesting an ecredit for the price difference. We'll notify you once the ecredit has been processed.
    
    Thank you for using Delta Flight Tracker!
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0062cc;">Price Drop Alert!</h1>
      <p>Good news! We've detected a price drop for your flight.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">${flightDetails.airline} ${flightDetails.flightNumber}</h2>
        <p><strong>Route:</strong> ${flightDetails.departureAirport} to ${flightDetails.arrivalAirport}</p>
        <p><strong>Date:</strong> ${new Date(flightDetails.departureDate).toLocaleDateString()}</p>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <div>
            <p style="margin: 0; color: #6c757d;">Original Price</p>
            <p style="margin: 0; font-size: 1.2em;">$${flightDetails.originalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p style="margin: 0; color: #6c757d;">Current Price</p>
            <p style="margin: 0; font-size: 1.2em;">$${flightDetails.newPrice.toFixed(2)}</p>
          </div>
          <div>
            <p style="margin: 0; color: #6c757d;">Savings</p>
            <p style="margin: 0; font-size: 1.2em; color: #28a745;">$${flightDetails.priceDifference.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <p>We're automatically requesting an ecredit for the price difference. We'll notify you once the ecredit has been processed.</p>
      
      <p>Thank you for using Delta Flight Tracker!</p>
    </div>
  `;
  
  return sendEmail({
    to,
    subject,
    text,
    html
  });
}

/**
 * Send an ecredit success notification email
 * @param to Recipient email address
 * @param ecreditDetails Ecredit details
 * @returns Whether the email was sent successfully
 */
export async function sendEcreditSuccessEmail(
  to: string,
  ecreditDetails: {
    airline: string;
    flightNumber: string;
    ecreditAmount: number;
    ecreditCode: string;
    ecreditExpirationDate?: string;
  }
): Promise<boolean> {
  const subject = `Ecredit Received: ${ecreditDetails.airline} ${ecreditDetails.flightNumber}`;
  
  const text = `
    Great news! We've successfully received an ecredit for your flight.
    
    Flight: ${ecreditDetails.airline} ${ecreditDetails.flightNumber}
    Ecredit Amount: $${ecreditDetails.ecreditAmount.toFixed(2)}
    Ecredit Code: ${ecreditDetails.ecreditCode}
    ${ecreditDetails.ecreditExpirationDate ? `Expiration Date: ${ecreditDetails.ecreditExpirationDate}` : ''}
    
    You can use this ecredit for future flights with ${ecreditDetails.airline}.
    
    Thank you for using Delta Flight Tracker!
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0062cc;">Ecredit Received!</h1>
      <p>Great news! We've successfully received an ecredit for your flight.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">${ecreditDetails.airline} ${ecreditDetails.flightNumber}</h2>
        
        <div style="margin-top: 20px;">
          <p style="margin: 5px 0;"><strong>Ecredit Amount:</strong> <span style="color: #28a745;">$${ecreditDetails.ecreditAmount.toFixed(2)}</span></p>
          <p style="margin: 5px 0;"><strong>Ecredit Code:</strong> ${ecreditDetails.ecreditCode}</p>
          ${ecreditDetails.ecreditExpirationDate ? `<p style="margin: 5px 0;"><strong>Expiration Date:</strong> ${ecreditDetails.ecreditExpirationDate}</p>` : ''}
        </div>
      </div>
      
      <p>You can use this ecredit for future flights with ${ecreditDetails.airline}.</p>
      
      <p>Thank you for using Delta Flight Tracker!</p>
    </div>
  `;
  
  return sendEmail({
    to,
    subject,
    text,
    html
  });
}
