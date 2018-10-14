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
      console.log("Checking against; ", uniqueHoster)
      if (connectedClients[user].computerName === uniqueHoster){
        connectedClients.splice(connectedClients.indexOf(connectedClients[user]), 1)
      }
    }
    console.log("Disconnect: ", connectedClients)
  });

  currentSocket.on("roomConnectionHost", function(data){
    uniqueHoster = data

    if (!connectedClients [ clientIp ]){
      connectedClients.push(
        {
          computerName: uniqueHoster,
          enabled: true,
          IP: clientIp,
        }
      )
    }
  })

  currentSocket.on("transmitToClients", function(data){
    socketIO.emit(data.computerName, data);
  })

  currentSocket.on("codeExecutionResponse", function(data){
    socketIO.emit("codeExecutionResponse", data)
  })
})


App.get('/', function(req, res){
  res.send("Server online")
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
