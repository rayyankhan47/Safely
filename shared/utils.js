// Shared utility functions between desktop and mobile apps

import { CONNECTION_CODE_LENGTH, CONNECTION_CODE_CHARS } from './constants.js';

export const generateConnectionCode = () => {
  let result = '';
  for (let i = 0; i < CONNECTION_CODE_LENGTH; i++) {
    result += CONNECTION_CODE_CHARS.charAt(Math.floor(Math.random() * CONNECTION_CODE_CHARS.length));
  }
  return result;
};

export const validateConnectionCode = (code) => {
  if (!code || code.length !== CONNECTION_CODE_LENGTH) {
    return false;
  }
  
  for (let char of code) {
    if (!CONNECTION_CODE_CHARS.includes(char)) {
      return false;
    }
  }
  
  return true;
};

export const formatDeviceName = (deviceInfo) => {
  if (!deviceInfo) return 'Unknown Device';
  
  const { name, model, platform } = deviceInfo;
  
  if (name && model) {
    return `${name}'s ${model}`;
  } else if (name) {
    return `${name}'s ${platform || 'Device'}`;
  } else if (model) {
    return `${model}`;
  }
  
  return 'Unknown Device';
}; 