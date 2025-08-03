/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  const [step, setStep] = useState(1);
  const [connectionCode, setConnectionCode] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [detectedSounds, setDetectedSounds] = useState([]);
  const { ipcRenderer } = window.require('electron');

  // Get connection info on component mount
  useEffect(() => {
    const getConnectionInfo = async () => {
      try {
        const info = await ipcRenderer.invoke('get-connection-info');
        setConnectionCode(info.connectionCode);
      } catch (error) {
        console.error('Error getting connection info:', error);
      }
    };
    getConnectionInfo();
  }, [ipcRenderer]);

  // Set up IPC listeners for mobile connection
  useEffect(() => {
    // Mobile connected
    ipcRenderer.on('mobile-connected', (event, data) => {
      console.log('Mobile connected:', data);
      setConnectedDevice(data.deviceInfo);
      setConnectionStatus('connected');
    });

    return () => {
      ipcRenderer.removeAllListeners('mobile-connected');
    };
  }, [ipcRenderer]);

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setConnectedDevice(null);
    setDetectedSounds([]);
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontWeight: 700, fontSize: 32, marginBottom: 16 }}>Welcome to Safely</h1>
          <p style={{ color: '#444', fontSize: 18, marginBottom: 32 }}>
            Your AI-powered ambient sound safety alert app for Mac.
          </p>
          <button onClick={() => setStep(2)} style={{ padding: '12px 32px', fontSize: 18, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            Start
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Disclaimer/Description
  if (step === 2) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 440, textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 16 }}>How Safely Works</h2>
          <p style={{ color: '#444', fontSize: 16, marginBottom: 16 }}>
            Safely listens to your environment through your phone and alerts you on your Mac if it detects potentially dangerous or important sounds.
          </p>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 24 }}>
            <b>Privacy:</b> All audio is processed locally on your phone. Nothing is recorded or sent online.
          </p>
          <button onClick={() => setStep(3)} style={{ padding: '12px 32px', fontSize: 18, borderRadius: 8, border: 'none', background: '#111', color: '#fff', fontWeight: 600, cursor: 'pointer', marginRight: 16 }}>
            Continue
          </button>
          <button onClick={() => setStep(1)} style={{ position: 'absolute', left: 0, bottom: 0, padding: '8px 20px', fontSize: 15, borderRadius: 8, border: 'none', background: '#eee', color: '#222', fontWeight: 500, cursor: 'pointer' }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Device Discovery Dashboard
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#fff', minHeight: '100vh', minWidth: '100vw', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        
        {connectionStatus === 'disconnected' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0, marginBottom: 24 }}>Connect Your Phone</h2>
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: '24px 32px', 
              borderRadius: 12, 
              fontSize: 32, 
              fontWeight: 700, 
              letterSpacing: '4px',
              color: '#111',
              marginBottom: 32,
              fontFamily: 'monospace'
            }}>
              {connectionCode}
            </div>
            
            <p style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>
              Enter this code in your mobile app to connect
            </p>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              Make sure both devices are on the same WiFi network
            </p>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px 20px', 
              borderRadius: 8, 
              border: '1px solid #e9ecef',
              marginBottom: 24
            }}>
              <p style={{ color: '#0a0', fontSize: 14, margin: 0 }}>
                ● Waiting for mobile app to connect...
              </p>
            </div>
          </div>
        )}

        {connectionStatus === 'connecting' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0, marginBottom: 24 }}>Connecting...</h2>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '24px 32px', 
              borderRadius: 12, 
              fontSize: 32, 
              fontWeight: 700, 
              letterSpacing: '4px',
              color: '#111',
              marginBottom: 32,
              fontFamily: 'monospace'
            }}>
              {connectionCode}
            </div>
            <p style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>
              Connecting to {selectedDevice?.name}'s {selectedDevice?.model}...
            </p>
            <p style={{ color: '#888', fontSize: 14 }}>
              Check your phone to confirm the connection code matches
            </p>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0, marginBottom: 16 }}>Connected!</h2>
            <p style={{ color: '#0a0', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              ● {connectedDevice?.name}'s {connectedDevice?.model} is connected!
            </p>
            <p style={{ color: '#666', fontSize: 16, marginBottom: 32 }}>
              Listening for sounds...
            </p>
            
            {detectedSounds.length > 0 && (
              <div style={{ marginTop: 24, textAlign: 'left', width: '100%' }}>
                <b style={{ color: '#111' }}>Recently detected:</b>
                <ul style={{ margin: '8px 0 0 0', padding: 0, listStyle: 'disc inside', color: '#666' }}>
                  {detectedSounds.slice(-5).map((sound, index) => (
                    <li key={index}>{sound}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button 
              onClick={handleDisconnect}
              style={{ 
                marginTop: 32,
                padding: '8px 20px', 
                fontSize: 15, 
                borderRadius: 8, 
                border: '1px solid #ccc', 
                background: '#fff', 
                color: '#666', 
                fontWeight: 500, 
                cursor: 'pointer' 
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
      
      <button onClick={() => setStep(2)} style={{ position: 'fixed', left: 32, bottom: 32, padding: '8px 20px', fontSize: 15, borderRadius: 8, border: 'none', background: '#eee', color: '#222', fontWeight: 500, cursor: 'pointer', zIndex: 10 }}>
        ← Back
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
