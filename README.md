# Safely - AI-Powered Ambient Sound Safety Alert System

Safely is a privacy-first, AI-powered system that monitors your environment through your phone and alerts you on your desktop when potentially dangerous or important sounds are detected.

## Architecture

Safely consists of two main components:

- **Desktop App** (Electron): Receives alerts, controls media, shows notifications
- **Mobile App** (React Native/Expo): Listens to environment, processes audio with YAMNet ML model

## Project Structure

```
Safely/
├── desktop/          # Electron desktop app
├── mobile/           # React Native mobile app  
├── shared/           # Shared utilities and constants
└── README.md
```

## Features

- **Real-time sound detection** using YAMNet ML model
- **Privacy-first**: All audio processing happens locally on your phone
- **Simple pairing**: Connect devices with a simple 8-character code
- **Media control**: Automatically pause music/videos when alerts are detected
- **Customizable**: Choose which sounds to monitor

## Development Setup

### Desktop App
```bash
cd desktop
npm install
npm start
```

### Mobile App
```bash
cd mobile
npm install
npm start
```

## Connection Flow

1. Desktop app generates a connection code
2. Mobile app enters the same code
3. Devices connect via WebSocket
4. Mobile app listens for sounds and sends alerts to desktop
5. Desktop app shows notifications and controls media

## Privacy

- All audio processing happens locally on your phone
- No audio is recorded or transmitted
- No data is sent to external servers
- Microphone access is only active when the app is running

## Tech Stack

- **Desktop**: Electron + React
- **Mobile**: React Native + Expo
- **ML Model**: YAMNet (TensorFlow.js)
- **Communication**: WebSocket
- **Audio Processing**: Web Audio API 