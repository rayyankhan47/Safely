const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const os = require('os');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

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
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

// Generate connection code
const generateConnectionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Start connection server
const startConnectionServer = () => {
  // Create a simple HTTP server for mobile to connect to
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/connect') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          console.log('Mobile connection request:', data);
          
          if (data.connectionCode === connectionCode) {
            // Code matches, establish connection
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Connection established',
              desktopIP: getLocalIP()
            }));
            
            // Update connection status
            if (mainWindow) {
              mainWindow.webContents.send('mobile-connected', {
                deviceInfo: data.deviceInfo,
                timestamp: Date.now()
              });
            }
          } else {
            // Code doesn't match
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Invalid connection code' 
            }));
          }
        } catch (error) {
          console.error('Error processing connection request:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'Server error' 
          }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  const CONNECTION_PORT = 3000;
  server.listen(CONNECTION_PORT, () => {
    console.log(`Connection server started on port ${CONNECTION_PORT}`);
    console.log(`Local IP: ${getLocalIP()}`);
    console.log(`Connection code: ${connectionCode}`);
  });
  
  return server;
};

// Generate connection code
const connectionCode = generateConnectionCode();

// IPC handlers for renderer communication
ipcMain.handle('get-connection-info', () => {
  return { 
    connectionCode: connectionCode,
    desktopIP: getLocalIP(),
    port: 3000
  };
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  // Start connection server
  startConnectionServer();

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
