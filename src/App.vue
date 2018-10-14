<template>
  <div id="app"></div>
</template>

<script>
import io from 'socket.io-client';
export default {
  name: "app",
  components: {},
  mounted: function(){
    let Socket = io.connect( 'http://198.211.125.38:3000/' )

    if (!localStorage.getItem('uniqueRoomNumber')){
      console.log("Setting localstorage")
      localStorage.setItem(
        'uniqueRoomNumber',
        Math.floor(Math.random()*16777215).toString(16).toUpperCase()
      )
    }

    Socket.emit('roomConnectionHost',
      localStorage.getItem('uniqueRoomNumber').toString()
    )

    Socket.on(
      localStorage.getItem('uniqueRoomNumber').toString(),
      function (data) {
        if (data.computerName === localStorage.getItem('uniqueRoomNumber').toString()){
          console.log(
            "Execute shell: ",
            data.shellCommand
          )
          new Notification('Calling function', {
            body: data.functionName
          })
        }
      }
    );
  }
};
</script>

<style lang="stylus">
html, body
  margin: 0
  background-color: #212121
</style>
