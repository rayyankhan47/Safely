import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import { generateConnectionCode } from '../utils.js';

export default function SafelyScreen() {
  const [step, setStep] = useState(1);
  const [connectionCode, setConnectionCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [ws, setWs] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [desktopCode, setDesktopCode] = useState('');

  // Generate connection code and get device info on mount
  useEffect(() => {
    setConnectionCode(generateConnectionCode());
    getDeviceInfo();
  }, []);

  const getDeviceInfo = async () => {
    const info = {
      name: Device.deviceName || 'Unknown',
      model: Device.modelName || Device.modelId || 'Unknown',
      platform: Platform.OS,
    };
    setDeviceInfo(info);
  };

  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for Safely to work.');
      }
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  const connectToDesktop = () => {
    try {
      // For now, we'll simulate WebSocket connection
      // In a real implementation, you'd use a WebSocket library
      console.log('Connecting to desktop WebSocket server...');
      
      // Simulate connection process
      setTimeout(() => {
        setWsConnected(true);
        setConnectionStatus('connected');
        
        // Simulate sending connection code to desktop
        console.log('Sending connection code to desktop:', connectionCode);
        
        // Simulate receiving connection acceptance
        setTimeout(() => {
          console.log('Connection accepted by desktop');
        }, 1000);
      }, 2000);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to desktop app. Make sure both devices are on the same network.');
    }
  };

  const handleConnect = async () => {
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;

    setConnectionStatus('connecting');
    connectToDesktop();
  };

  const handleDisconnect = () => {
    if (ws) {
      ws.close();
    }
    setConnectionStatus('disconnected');
    setWsConnected(false);
    setWs(null);
  };

  const simulateSoundDetection = () => {
    if (wsConnected) {
      // Simulate detecting a sound
      const soundData = {
        type: 'sound-detected',
        sound: 'Screaming',
        timestamp: new Date().toISOString(),
        confidence: 0.85
      };
      
      console.log('Sending sound alert to desktop:', soundData);
      
      // In real implementation, this would be sent via WebSocket
      Alert.alert('Sound Detected!', 'Screaming detected - alert sent to desktop');
    }
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Safely</Text>
          <Text style={styles.subtitle}>
            Your AI-powered ambient sound safety alert app for mobile.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: How it works
  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>How Safely Works</Text>
          <Text style={styles.description}>
            Safely listens to your environment and alerts your Mac if it detects potentially dangerous or important sounds.
          </Text>
          <Text style={styles.privacy}>
            <Text style={styles.bold}>Privacy:</Text> All audio is processed locally on your phone. Nothing is recorded or sent online.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 3: Connection Dashboard
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {connectionStatus === 'disconnected' && (
          <View>
            <Text style={styles.title}>Connect to Desktop</Text>
            <Text style={styles.description}>
              Enter this code on your Mac to connect:
            </Text>
            <View style={styles.codeContainer}>
              <Text style={styles.connectionCode}>{connectionCode}</Text>
            </View>
            <Text style={styles.hint}>
              Make sure both devices are on the same WiFi network
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleConnect}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}

        {connectionStatus === 'connecting' && (
          <View>
            <Text style={styles.title}>Connecting...</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.connectionCode}>{connectionCode}</Text>
            </View>
            <Text style={styles.description}>
              Waiting for desktop app to confirm connection...
            </Text>
          </View>
        )}

        {connectionStatus === 'connected' && (
          <View>
            <Text style={styles.title}>Connected!</Text>
            <Text style={styles.connectedText}>
              ● {deviceInfo?.name}'s {deviceInfo?.model} is connected!
            </Text>
            <Text style={styles.description}>
              Listening for sounds...
            </Text>
            
            {/* Test button for sound detection */}
            <TouchableOpacity style={styles.testButton} onPress={simulateSoundDetection}>
              <Text style={styles.testButtonText}>Test Sound Detection</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  privacy: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  connectionCode: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#111',
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  connectedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0',
    marginBottom: 8,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  disconnectButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  backButtonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
});
