const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const dgram = require('dgram');
const os = require('os');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let discoverySocket;
let discoveredDevices = new Map(); // deviceId -> deviceInfo
const DISCOVERY_PORT = 41234;
const DISCOVERY_MESSAGE = 'SAFELY_DISCOVERY';

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// Get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return '127.0.0.1';
};

// Start device discovery
const startDeviceDiscovery = () => {
  discoverySocket = dgram.createSocket('udp4');
  
  discoverySocket.on('error', (err) => {
    console.error('Discovery socket error:', err);
  });

  // Listen for device broadcasts
  discoverySocket.on('message', (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());
      console.log('Received discovery message:', data);
      
      if (data.type === 'device-broadcast') {
        // Mobile device is announcing itself
        const deviceId = `${rinfo.address}:${rinfo.port}`;
        discoveredDevices.set(deviceId, {
          ...data.deviceInfo,
          address: rinfo.address,
          port: rinfo.port,
          lastSeen: Date.now()
        });
        
        // Send updated device list to renderer
        if (mainWindow) {
          mainWindow.webContents.send('devices-updated', Array.from(discoveredDevices.values()));
        }
      }
    } catch (error) {
      console.error('Error parsing discovery message:', error);
    }
  });

  // Broadcast discovery message periodically
  const broadcastDiscovery = () => {
    const message = JSON.stringify({
      type: 'discovery-request',
      from: 'desktop',
      timestamp: Date.now()
    });
    
    discoverySocket.send(message, DISCOVERY_PORT, '255.255.255.255');
  };

  // Start listening
  discoverySocket.bind(DISCOVERY_PORT, () => {
    discoverySocket.setBroadcast(true);
    console.log(`Device discovery started on port ${DISCOVERY_PORT}`);
    
    // Broadcast discovery request every 5 seconds
    broadcastDiscovery();
    setInterval(broadcastDiscovery, 5000);
  });
};

// Send connection code to specific device
const sendConnectionCode = (deviceAddress, devicePort, connectionCode) => {
  const message = JSON.stringify({
    type: 'connection-request',
    connectionCode: connectionCode,
    timestamp: Date.now()
  });
  
  discoverySocket.send(message, devicePort, deviceAddress);
  console.log(`Sent connection code ${connectionCode} to ${deviceAddress}:${devicePort}`);
};

// IPC handlers for renderer communication
ipcMain.handle('start-device-discovery', () => {
  startDeviceDiscovery();
  return { success: true, port: DISCOVERY_PORT };
});

ipcMain.handle('send-connection-code', (event, { deviceAddress, devicePort, connectionCode }) => {
  sendConnectionCode(deviceAddress, devicePort, connectionCode);
  return { success: true };
});

ipcMain.handle('get-discovered-devices', () => {
  return Array.from(discoveredDevices.values());
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  // Start device discovery
  startDeviceDiscovery();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up discovery socket on app quit
app.on('before-quit', () => {
  if (discoverySocket) {
    discoverySocket.close();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
