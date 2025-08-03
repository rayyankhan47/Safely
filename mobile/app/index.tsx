import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import { generateConnectionCode } from '../utils.js';
import dgram from 'react-native-udp';

export default function SafelyScreen() {
  const [step, setStep] = useState(1);
  const [connectionCode, setConnectionCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [receivedCode, setReceivedCode] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const DISCOVERY_PORT = 8888;
  const BROADCAST_ADDRESS = '255.255.255.255';
  let discoverySocket = null;

  // Generate connection code and get device info on mount
  useEffect(() => {
    setConnectionCode(generateConnectionCode());
    getDeviceInfo();
    
    // Cleanup UDP socket on unmount
    return () => {
      if (discoverySocket) {
        discoverySocket.close();
        discoverySocket = null;
      }
    };
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

  const startBroadcasting = () => {
    setIsBroadcasting(true);
    console.log('Started broadcasting device presence...');
    
    // Create UDP socket for broadcasting
    discoverySocket = dgram.createSocket('udp4');
    
    discoverySocket.on('error', (err) => {
      console.error('UDP socket error:', err);
      setIsBroadcasting(false);
    });
    
    // Listen for discovery requests and connection codes
    discoverySocket.on('message', (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());
        console.log('Received UDP message:', data, 'from:', rinfo.address);
        
        if (data.type === 'discovery-request') {
          // Desktop is looking for devices, respond with broadcast
          const broadcastMessage = {
            type: 'device-broadcast',
            deviceInfo: deviceInfo,
            timestamp: Date.now()
          };
          
          discoverySocket.send(JSON.stringify(broadcastMessage), DISCOVERY_PORT, rinfo.address);
          console.log('Responded to discovery request from:', rinfo.address);
        } else if (data.type === 'connection-request') {
          // Desktop sent connection code
          setReceivedCode(data.connectionCode);
          console.log('Received connection code:', data.connectionCode);
        }
      } catch (error) {
        console.error('Error parsing UDP message:', error);
      }
    });
    
    // Start listening
    discoverySocket.bind(DISCOVERY_PORT, () => {
      discoverySocket.setBroadcast(true);
      console.log(`UDP listening on port ${DISCOVERY_PORT}`);
      
      // Broadcast presence periodically
      const broadcastPresence = () => {
        const broadcastMessage = {
          type: 'device-broadcast',
          deviceInfo: deviceInfo,
          timestamp: Date.now()
        };
        
        discoverySocket.send(JSON.stringify(broadcastMessage), DISCOVERY_PORT, BROADCAST_ADDRESS);
        console.log('Broadcasting presence...');
      };
      
      // Broadcast immediately and every 3 seconds
      broadcastPresence();
      setInterval(broadcastPresence, 3000);
    });
  };

  const handleConnect = async () => {
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) return;

    setConnectionStatus('connecting');
    startBroadcasting();
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setIsBroadcasting(false);
    setReceivedCode('');
    
    // Close UDP socket
    if (discoverySocket) {
      discoverySocket.close();
      discoverySocket = null;
      console.log('UDP socket closed');
    }
  };

  const confirmConnection = () => {
    if (receivedCode === connectionCode) {
      setConnectionStatus('connected');
      Alert.alert('Connected!', 'Successfully connected to desktop app.');
    } else {
      Alert.alert('Code Mismatch', 'The connection code does not match. Please try again.');
      setConnectionStatus('disconnected');
      setReceivedCode('');
    }
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

  // Step 3: Device Discovery Dashboard
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {connectionStatus === 'disconnected' && (
          <View>
            <Text style={styles.title}>Waiting for Desktop</Text>
            <Text style={styles.description}>
              Your phone is broadcasting its presence on the network.
            </Text>
            
            {isBroadcasting ? (
              <View style={styles.broadcastingContainer}>
                <Text style={styles.broadcastingText}>
                  ● Broadcasting on port {DISCOVERY_PORT}
                </Text>
                <Text style={styles.broadcastingText}>
                  Device: {deviceInfo?.name}'s {deviceInfo?.model}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleConnect}>
                <Text style={styles.buttonText}>Start Broadcasting</Text>
              </TouchableOpacity>
            )}
            
            <Text style={styles.hint}>
              Open Safely on your Mac and select this device from the list
            </Text>
          </View>
        )}

        {connectionStatus === 'connecting' && (
          <View>
            <Text style={styles.title}>Connection Request</Text>
            
            {receivedCode ? (
              <View>
                <Text style={styles.description}>
                  Desktop app wants to connect with this code:
                </Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.connectionCode}>{receivedCode}</Text>
                </View>
                <Text style={styles.description}>
                  Does this match the code shown on your Mac?
                </Text>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.confirmButton} onPress={confirmConnection}>
                    <Text style={styles.confirmButtonText}>Yes, Connect</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={() => {
                    setConnectionStatus('disconnected');
                    setReceivedCode('');
                  }}>
                    <Text style={styles.rejectButtonText}>No, Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.description}>
                  Waiting for connection code from desktop...
                </Text>
                <View style={styles.broadcastingContainer}>
                  <Text style={styles.broadcastingText}>
                    ● Broadcasting on port {DISCOVERY_PORT}
                  </Text>
                </View>
              </View>
            )}
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
