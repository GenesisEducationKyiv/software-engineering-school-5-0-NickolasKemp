import {
  ConfirmationEmailData,
  EmailTemplate,
  WeatherUpdateEmailData,
} from 'src/interfaces/email.interface';

export const generateConfirmationTemplate = (data: ConfirmationEmailData): EmailTemplate => {
  const { token, appUrl } = data;
  const confirmUrl = `${appUrl}/api/confirm/${token}`;

  return {
    subject: 'Confirm Your Weather Subscription',
    text: `Please click the following link to confirm your weather subscription: ${confirmUrl}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Weather Subscription Confirmation</h2>
      <p>Thank you for subscribing to our weather updates service!</p>
      <p>Please click the button below to confirm your subscription:</p>
      <a href="${confirmUrl}" style="display: inline-block; background-color:rgb(37, 99, 235); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Confirm Subscription
      </a>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${confirmUrl}</p>
    </div>
  `,
  };
};

export const generateWeatherUpdateTemplate = (data: WeatherUpdateEmailData): EmailTemplate => {
  const { city, weather, unsubscribeToken, appUrl } = data;
  const unsubscribeUrl = `${appUrl}/api/unsubscribe/${unsubscribeToken}`;

  return {
    subject: `Weather Update for ${city}`,
    text: `
  Current Weather for ${city}:
  Temperature: ${weather.temperature}°C
  Humidity: ${weather.humidity}%
  Conditions: ${weather.description}
  
  To unsubscribe from these updates, click here: ${unsubscribeUrl}
  `,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Weather Update for ${city}</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Temperature:</strong> ${weather.temperature}°C</p>
        <p><strong>Humidity:</strong> ${weather.humidity}%</p>
        <p><strong>Conditions:</strong> ${weather.description}</p>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        To unsubscribe from these updates, 
        <a href="${unsubscribeUrl}">click here</a>
      </p>
    </div>
  `,
  };
};
