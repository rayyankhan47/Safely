const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const WebSocket = require('ws');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let wss; // WebSocket server

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

// WebSocket server setup
const startWebSocketServer = () => {
  const PORT = 8080;
  wss = new WebSocket.Server({ port: PORT });
  
  console.log(`WebSocket server started on port ${PORT}`);

  wss.on('connection', (ws) => {
    console.log('Mobile app connected!');
    
    // Send connection confirmation to renderer
    if (mainWindow) {
      mainWindow.webContents.send('mobile-connected', {
        deviceInfo: 'Mobile Device',
        timestamp: new Date().toISOString()
      });
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received from mobile:', data);
        
        // Forward message to renderer
        if (mainWindow) {
          mainWindow.webContents.send('mobile-message', data);
        }
        
        // Handle different message types
        switch (data.type) {
          case 'connect':
            // Mobile app is trying to connect with a code
            if (mainWindow) {
              mainWindow.webContents.send('mobile-connect-attempt', data);
            }
            break;
            
          case 'sound-detected':
            // Mobile detected a sound - show notification
            if (mainWindow) {
              mainWindow.webContents.send('sound-alert', data);
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Mobile app disconnected');
      if (mainWindow) {
        mainWindow.webContents.send('mobile-disconnected');
      }
    });
  });
};

// IPC handlers for renderer communication
ipcMain.handle('start-websocket-server', () => {
  startWebSocketServer();
  return { success: true, port: 8080 };
});

ipcMain.handle('send-to-mobile', (event, message) => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  return { success: true };
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  
  // Start WebSocket server
  startWebSocketServer();

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

// Clean up WebSocket server on app quit
app.on('before-quit', () => {
  if (wss) {
    wss.close();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
