import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import { generateConnectionCode } from '../utils.js';

export default function SafelyScreen() {
  const [step, setStep] = useState(1);
  const [connectionCode, setConnectionCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [desktopCode, setDesktopCode] = useState('');
  const [desktopIP, setDesktopIP] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

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

  const connectToDesktop = async () => {
    if (!desktopCode.trim()) {
      Alert.alert('Error', 'Please enter the connection code');
      return;
    }
    
    setIsConnecting(true);
    console.log('Connecting to desktop with code:', desktopCode);
    
    try {
      // Try common local network IPs
      const possibleIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.100', '172.20.10.5'];
      
      for (const ip of possibleIPs) {
        try {
          const response = await fetch(`http://${ip}:3000/connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              connectionCode: desktopCode,
              deviceInfo: deviceInfo,
              timestamp: Date.now()
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('Successfully connected to desktop!');
            setConnectionStatus('connected');
            setDesktopIP(ip);
            Alert.alert('Connected!', 'Successfully connected to desktop app.');
            return;
          }
        } catch (error) {
          console.log(`Failed to connect to ${ip}:`, error.message);
        }
      }
      
      Alert.alert('Connection Failed', 'Could not find desktop app. Make sure both devices are on the same network and the desktop app is running.');
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect to desktop app.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;

    setStep(3);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setDesktopCode('');
    setDesktopIP('');
    setIsConnecting(false);
  };

  const simulateSoundDetection = () => {
    if (connectionStatus === 'connected') {
      // Simulate detecting a sound
      const soundData = {
        type: 'sound-detected',
        sound: 'Screaming',
        timestamp: new Date().toISOString(),
        confidence: 0.85
      };
      
      console.log('Sending sound alert to desktop:', soundData);
      
      // In real implementation, this would be sent via UDP
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

  // Step 3: Connect to Desktop
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {connectionStatus === 'disconnected' && (
          <View>
            <Text style={styles.title}>Connect to Desktop</Text>
            <Text style={styles.description}>
              Enter the connection code from your desktop app.
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Connection Code:</Text>
              <TextInput
                style={styles.input}
                value={desktopCode}
                onChangeText={setDesktopCode}
                placeholder="Enter code (e.g., Z4A09VF3)"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={8}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, isConnecting && styles.buttonDisabled]} 
              onPress={connectToDesktop}
              disabled={isConnecting}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? 'Connecting...' : 'Connect to Desktop'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.hint}>
              Make sure both devices are on the same WiFi network
            </Text>
          </View>
        )}

        {connectionStatus === 'connected' && (
          <View>
            <Text style={styles.title}>Connected!</Text>
            <Text style={styles.description}>
              Your phone is now connected to the desktop app.
            </Text>
            
            <View style={styles.connectedContainer}>
              <Text style={styles.connectedText}>
                ● Connected to desktop ({desktopIP})
              </Text>
              <Text style={styles.connectedText}>
                ● Listening for sounds...
              </Text>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={simulateSoundDetection}>
              <Text style={styles.buttonText}>Test Sound Detection</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.disconnectButton]} onPress={handleDisconnect}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
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
  broadcastingContainer: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  broadcastingText: {
    fontSize: 14,
    color: '#0066cc',
    marginBottom: 4,
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#0a0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
