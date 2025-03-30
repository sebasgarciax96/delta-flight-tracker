import twilio from 'twilio';

interface SMSOptions {
  to: string;
  message: string;
}

/**
 * Send an SMS notification
 * @param options SMS options
 * @returns Whether the SMS was sent successfully
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // In a production environment, use environment variables for these settings
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    
    // Check if Twilio credentials are configured
    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio credentials not configured');
      return false;
    }
    
    // Create a Twilio client
    const client = twilio(accountSid, authToken);
    
    // Format the phone number (ensure it has the country code)
    const formattedNumber = formatPhoneNumber(options.to);
    
    // Send the SMS
    const message = await client.messages.create({
      body: options.message,
      from: fromNumber,
      to: formattedNumber
    });
    
    console.log('SMS sent:', message.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Format a phone number to ensure it has the country code
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number doesn't start with a country code (e.g., +1 for US),
  // add the default country code (assuming US)
  if (!phoneNumber.startsWith('+')) {
    // For US numbers
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    // For international numbers that might be missing the + sign
    return `+${digitsOnly}`;
  }
  
  return phoneNumber;
}

/**
 * Send a price drop notification SMS
 * @param to Recipient phone number
 * @param flightDetails Flight details
 * @returns Whether the SMS was sent successfully
 */
export async function sendPriceDropSMS(
  to: string,
  flightDetails: {
    airline: string;
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    originalPrice: number;
    newPrice: number;
    priceDifference: number;
  }
): Promise<boolean> {
  const message = `
Price Drop Alert: ${flightDetails.airline} ${flightDetails.flightNumber}
${flightDetails.departureAirport} to ${flightDetails.arrivalAirport}
Original: $${flightDetails.originalPrice.toFixed(2)}
Current: $${flightDetails.newPrice.toFixed(2)}
Savings: $${flightDetails.priceDifference.toFixed(2)}
We're requesting an ecredit for you.
  `.trim();
  
  return sendSMS({
    to,
    message
  });
}

/**
 * Send an ecredit success notification SMS
 * @param to Recipient phone number
 * @param ecreditDetails Ecredit details
 * @returns Whether the SMS was sent successfully
 */
export async function sendEcreditSuccessSMS(
  to: string,
  ecreditDetails: {
    airline: string;
    flightNumber: string;
    ecreditAmount: number;
    ecreditCode: string;
    ecreditExpirationDate?: string;
  }
): Promise<boolean> {
  const message = `
Ecredit Received: ${ecreditDetails.airline} ${ecreditDetails.flightNumber}
Amount: $${ecreditDetails.ecreditAmount.toFixed(2)}
Code: ${ecreditDetails.ecreditCode}
${ecreditDetails.ecreditExpirationDate ? `Expires: ${ecreditDetails.ecreditExpirationDate}` : ''}
  `.trim();
  
  return sendSMS({
    to,
    message
  });
}
