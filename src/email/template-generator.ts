import {
  ConfirmationEmailData,
  EmailTemplate,
  WeatherUpdateEmailData,
} from 'src/interfaces/email.interface';
import * as fs from 'fs';
import * as path from 'path';

const readTemplate = (templateName: string): string => {
  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
};

const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => variables[key] || match);
};

export const generateConfirmationTemplate = (data: ConfirmationEmailData): EmailTemplate => {
  const { token, appUrl } = data;
  const confirmUrl = `${appUrl}/api/confirm/${token}`;

  const htmlTemplate = readTemplate('confirmation');
  const html = replaceTemplateVariables(htmlTemplate, { confirmUrl });

  return {
    subject: 'Confirm Your Weather Subscription',
    text: `Please click the following link to confirm your weather subscription: ${confirmUrl}`,
    html,
  };
};

export const generateWeatherUpdateTemplate = (data: WeatherUpdateEmailData): EmailTemplate => {
  const { city, weather, unsubscribeToken, appUrl } = data;
  const unsubscribeUrl = `${appUrl}/api/unsubscribe/${unsubscribeToken}`;

  const htmlTemplate = readTemplate('weather-update');
  const html = replaceTemplateVariables(htmlTemplate, {
    city,
    temperature: weather.temperature.toString(),
    humidity: weather.humidity.toString(),
    description: weather.description,
    unsubscribeUrl,
  });

  return {
    subject: `Weather Update for ${city}`,
    text: `
          Current Weather for ${city}:
          Temperature: ${weather.temperature}°C
          Humidity: ${weather.humidity}%
          Conditions: ${weather.description}

          To unsubscribe from these updates, click here: ${unsubscribeUrl}
          `,
    html,
  };
};
