// Shared constants between desktop and mobile apps

export const SOUND_TYPES = [
  'Screaming',
  'Fire alarm',
  'Glass breaking',
  'Coughing',
  'Choking',
  'Gunshot',
  'Dog barking',
];

export const ENVIRONMENTS = [
  'Isolated bedroom/office',
  'Open space',
  'Kitchen',
  'Living room',
  'Other',
];

export const CONNECTION_CODE_LENGTH = 8;
export const CONNECTION_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const WEBSOCKET_PORT = 8080;
export const WEBSOCKET_URL = `ws://localhost:${WEBSOCKET_PORT}`;

export const MESSAGE_TYPES = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  SOUND_DETECTED: 'sound_detected',
  STATUS_UPDATE: 'status_update',
}; 