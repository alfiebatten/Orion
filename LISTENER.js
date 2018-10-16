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
    socketIO.emit(data.computerName, data);
  })

  currentSocket.on("codeExecutionResponse", function(data){
    socketIO.emit("codeExecutionResponse", data)
  })
})

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
    HTTP.address().port,
  );
});
