"use strict";

import { app, protocol, BrowserWindow } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
const overrideDev = false;
const { Menu } = require("electron");

if (overrideDev || isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require("module").globalPaths.push(process.env.NODE_MODULES_PATH);
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;
let menuTemplate = [
  {
    label: "Application",
    submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function() {
          app.quit();
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:"
      }
    ]
  }
];

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(["app"], { secure: true });
function createMainWindow() {
  const window = new BrowserWindow({
    backgroundColor: "#dcdde1",
    width: 900,
    title: "Orion - client",
    titleBarStyle: "hiddenInset",
    webPreferences: { webSecurity: false, zoomFactor: 0.65 },
    icon: path.join(__dirname, "assets/Icons/1024x1024.png")
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  if (isDevelopment) {
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) window.webContents.openDevTools();
  } else {
    createProtocol("app");
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }
  window.on("closed", () => {
    mainWindow = null;
  });
  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => window.focus());
  });
  return window;
}

app.setName("Orion client");

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on("ready", async () => {
  if (overrideDev || (isDevelopment && !process.env.IS_TEST)) {
    // Install Vue Devtools
    await installVueDevtools();
  }
  mainWindow = createMainWindow();
});
