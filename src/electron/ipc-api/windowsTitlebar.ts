import {
  ipcMain, BrowserView, BrowserWindow,
} from 'electron';
import { isDevMode } from '../../environment';
import { WINDOWS_TITLEBAR_FETCH_MENU, WINDOWS_TITLEBAR_INITIALIZE, WINDOWS_TITLEBAR_RESIZE, WINDOWS_TITLEBAR_TOGGLE_DEV_TOOLS } from '../../ipcChannels';
import { windowsTitleBarHeight } from '../../theme/default/legacy';

export default async ({ mainWindow }: { mainWindow: BrowserWindow}) => {
  let view: BrowserView;

  ipcMain.on(WINDOWS_TITLEBAR_INITIALIZE, async () => {
    if (view) return;

    view = new BrowserView({
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    });

    mainWindow.addBrowserView(view);

    view.setBounds({
      width: mainWindow.getBounds().width,
      height: parseInt(windowsTitleBarHeight, 10),
      x: 0,
      y: 0,
    });

    // eslint-disable-next-line global-require
    require('@electron/remote/main').enable(view.webContents);

    mainWindow.setTopBrowserView(view);

    view.webContents.loadFile('overlay.html', {
      hash: '/windows-titlebar',
    });
  });

  // IPC Hooks
  ipcMain.on(WINDOWS_TITLEBAR_RESIZE, (event, newBounds: Electron.Rectangle) => {
    const bounds = view.getBounds();

    view.setBounds({
      width: newBounds.width ?? bounds.width,
      height: newBounds.height ?? bounds.height,
      x: newBounds.x ?? bounds.x,
      y: newBounds.y ?? bounds.y,
    });

    mainWindow.setTopBrowserView(view);
  });

  ipcMain.on(WINDOWS_TITLEBAR_FETCH_MENU, (event, menuData) => {
    view.webContents.send(WINDOWS_TITLEBAR_FETCH_MENU, menuData);
  });

  ipcMain.on(WINDOWS_TITLEBAR_TOGGLE_DEV_TOOLS, (event, menuData) => {
    if (view.webContents.isDevToolsOpened()) {
      view.webContents.closeDevTools();
    } else {
      view.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Window Events
  mainWindow.on('enter-full-screen', () => {
    mainWindow.removeBrowserView(view);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.addBrowserView(view);

    // coming back from fullscreen sometimes gets view stuck width mini-width
    view.setBounds({
      ...view.getBounds(),
      width: mainWindow.getBounds().width,
    });
  });

  // `view.setAutoResize()` is using wrong window dimensions?
  mainWindow.on('resize', () => {
    if (!view) return;

    const mainWindowBounds = mainWindow.getContentBounds();
    const viewBounds = view.getBounds();

    view.setBounds({
      width: mainWindowBounds.width,
      height: viewBounds.height,
      x: viewBounds.x,
      y: viewBounds.y,
    });
  });
};
