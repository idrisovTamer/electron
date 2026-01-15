/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// Настройка логов для POS системы ATOL OPTIMA v7
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB максимальный размер файла
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
// Путь к логам: %LOCALAPPDATA%\MyPOSApp\logs

// Фиксация GPU для стабильности на Embedded Windows (ATOL OPTIMA v7)
// Предотвращает глюки GPU, черный экран и падения Chromium
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Auto-updater отключен для POS системы ATOL OPTIMA v7
// На кассовых терминалах обновления обычно управляются вручную

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    // POS режим: полноэкранный режим и скрытие меню
    fullscreen: !isDebug, // Fullscreen только в production
    kiosk: !isDebug, // Kiosk режим для предотвращения выхода кассира
    autoHideMenuBar: true, // Скрыть меню бар
    webPreferences: {
      // Безопасность: Context Isolation (стандарт Electron 31+)
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Блокировка DevTools в production (критично для POS безопасности)
  if (!isDebug) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Блокируем F12 и Ctrl+Shift+I
      if (
        input.key === 'F12' ||
        (input.control && input.shift && input.key === 'I')
      ) {
        event.preventDefault();
        log.warn('Попытка открытия DevTools заблокирована');
      }
    });

    // Отключаем контекстное меню (правую кнопку мыши)
    mainWindow.webContents.on('context-menu', (event) => {
      event.preventDefault();
    });
  }

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
    
    log.info('MyPOSApp запущен успешно');
  });

  // Защита от закрытия приложения кассиром (Alt+F4, крестик)
  mainWindow.on('close', (event) => {
    if (!isDebug) {
      event.preventDefault();
      log.warn('Попытка закрыть приложение заблокирована. Закрытие доступно только администратору.');
      // Можно добавить диалог с паролем администратора
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Auto-updater отключен для POS системы (не требуется на ATOL OPTIMA v7)
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    // Автозапуск при старте Windows (для основной кассы)
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe'),
      });
      log.info('Автозапуск включен');
    }

    createWindow();

    // Watchdog: проверка стабильности каждые 10 секунд (критично для 24/7)
    setInterval(() => {
      if (mainWindow && mainWindow.isDestroyed()) {
        log.error('Renderer crashed, restarting app');
        app.relaunch();
        app.exit(0);
      }
    }, 10_000);

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
