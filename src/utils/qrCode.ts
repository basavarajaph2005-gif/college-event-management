import QRCode from 'qrcode';
import { StudentRegistration } from '../types/event';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate a scannable QR Code Data URL for a student registration
 */
export async function generateRegistrationQRCode(
  registration: StudentRegistration,
  options: QRCodeOptions = {}
): Promise<string> {
  const payload = JSON.stringify({
    pass: 'CAMPUS_EVENTS_TICKET',
    id: registration.id,
    name: registration.name,
    usn: registration.usn,
    event: registration.eventTitle,
    seats: registration.seats,
    amount: registration.amount,
    venue: registration.venue,
    date: registration.date,
    time: registration.time,
  });

  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: options.width || 320,
    margin: options.margin || 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: options.color?.dark || '#042F2E', // Deep Teal
      light: options.color?.light || '#FFFFFF',
    },
  });

  return qrDataUrl;
}

/**
 * Generate verification URL or text payload for direct mobile scanning
 */
export function getTicketVerificationUrl(registration: StudentRegistration): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://campusevents.college.edu';
  return `${origin}/#pass?id=${registration.id}&usn=${encodeURIComponent(registration.usn)}`;
}
