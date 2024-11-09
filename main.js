const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require('electron');
const { screen } = require('electron');
const path = require('path');

let mainWindow = null;
let settingsWindow = null; // Settings window
let tray = null; // Tray instance

function createWindow() {
  if (mainWindow) return; // Prevent creating window multiple times

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setAlwaysOnTop(true);
  mainWindow.loadFile('index.html');
  
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('focus-input'); // Send message to focus input field
  });
  
  // Hide window when losing focus
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      mainWindow.hide();
    }
  });
}

// Function to create settings window
function createSettingsWindow() {
  if (settingsWindow) return; // Prevent creating settings window multiple times

  settingsWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: true,
    resizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  settingsWindow.loadFile('settings.html'); // Load the settings page
  
  settingsWindow.on('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('close', () => {
    settingsWindow = null;
  });
}

// Function to create tray icon
function createTray() {
  const trayIconPath = path.join(__dirname, '/images/tray-icon.png'); // Path to tray icon image
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Chat',
      click: () => {
        if (!mainWindow) {
          createWindow(); // Ensure window is created if it hasn't been yet
        }
        mainWindow.show(); // Show the main window if it's not null
      }
    },
    {
      label: 'Settings',
      click: () => {
        if (!settingsWindow) {
          createSettingsWindow(); // Create settings window if it doesn't exist
        } else {
          settingsWindow.show(); // Show settings window if it's already created
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Chatbot App');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      if (!mainWindow) {
        createWindow(); // Ensure window is created if it's null
      }
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  // Register global shortcut (Ctrl + X)
  globalShortcut.register('CommandOrControl+X', () => {
    if (!mainWindow) {
      createWindow();
    }
    
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      // Center window on screen
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      const windowBounds = mainWindow.getBounds();
      
      mainWindow.setPosition(
        Math.round(width / 2 - windowBounds.width / 2),
        Math.round(height / 2 - windowBounds.height / 2)
      );
      
      mainWindow.show();
    }
  });

  // Create the tray icon
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any cleanup when app is quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});