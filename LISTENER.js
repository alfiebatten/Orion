let App         =  require("express")();
let HTTP        =  require("http").Server(App);
let socketIO    =  require("socket.io")(HTTP);

let connectedClients = []

socketIO.on("connection", function(currentSocket){
  let socketId = currentSocket.id;
  let clientIp = currentSocket.request.connection.remoteAddress;
  let uniqueHoster

  console.log(
    "Connected from client: ",
    clientIp,
    currentSocket.handshake.headers.host
  )

  currentSocket.on('disconnect', function() {
    for (let user in connectedClients){
      if (connectedClients[user].computerName === uniqueHoster){
        connectedClients.splice(connectedClients.indexOf(connectedClients[user]), 1)
      }
    }
    socketIO.emit("DisconnectionFromClient", uniqueHoster);
  });

  currentSocket.on("roomConnectionHost", function(data){
    uniqueHoster = data

    for (let userSpecific of connectedClients){
      if (userSpecific.computerName === uniqueHoster) return
    }

    console.log("Pushing; ",
      {
        computerName: uniqueHoster,
        enabled: true,
        IP: clientIp,
      }
    )

    socketIO.emit("newConnectionFromClient", uniqueHoster);
    connectedClients.push(
      {
        computerName: uniqueHoster,
        enabled: true,
        IP: clientIp,
      }
    )
  })

  currentSocket.on("transmitToClients", function(data){
    if (!data || data.auth !== "B3GHU8"){
      return socketIO.emit("codeExecutionResponse", {
        uniqueRoomNumber: data.computerName,
        stdout: "FAILED TO EXECUTE",
        stderr: "PERMISSION DENIED: NON AUTHORISED REQUEST\n\n- Thank you for using a Lyons Inc. product 🦁🔥\n- Credentials: SLY.INC"
      })
    };

    socketIO.emit(data.computerName, data);
  })

  currentSocket.on("codeExecutionResponse", function(data){
    socketIO.emit("codeExecutionResponse", data)
  })
})

App.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

App.get('/', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      Response: "[WINDOWS]: Server online"
    })
  );
})

App.get('/activeClients', function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.send(
    JSON.stringify(connectedClients)
  );
})

HTTP.listen(3000, function(){
  console.log(
    "listening on: ",
    HTTP.address().port
  );
});
