<template>
  <div class="deviceControlContainer">
    <div class = "connectedListTitle">
      <h2>
        {{ deviceData.isConnected === true ? "Connected to: " : "Disconnected from: " }}
        <b>{{ deviceData.name }}</b>
      </h2>
    </div>

    <div class = "mainContainerPicker">
      <div class = "devicePicker">
        <div
          class = "deviceCard"
          v-for="controlOptions in controlFunctions"
          :key="controlOptions.functionName"
          v-bind:class = "[controlOptions.requiresInput ? 'expandCard' : '']"
        >
          <div
            v-bind:class = "[controlOptions.enabled && controlOptions.function ? 'onlineTransform' : 'offlineTransform']"
          >
            <div class = "titleComponent">
              <h1>{{ controlOptions.functionName }}</h1>
            </div>

            <div v-if = "controlOptions.requiresInput" class = "iconAndInputComponent">
              <div class = "inputContainer">
                <input
                  v-bind:placeholder = "controlOptions.placeHolder"
                  v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName)"
                >
              </div>
              <div class = "iconContainer">
                <i v-on:click = "prepareExecution(controlOptions, $event, 'requiresInput')" class="material-icons icon">{{ controlOptions.enabled && controlOptions.function ? 'chevron_right' : 'close' }}</i>
              </div>
            </div>

            <div v-else class = "iconComponent single">
              <div class = "iconContainer">
                <i v-on:click = "prepareExecution(controlOptions, $event)" class="material-icons icon">{{ controlOptions.enabled && controlOptions.function ? 'chevron_right' : 'close' }}</i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import animateElements from "animejs";
import { EventBus } from "../eventBus.js";
import SocketsIO from "socket.io-client";

export default {
  name: "controlFunctions",
  props: {
    mainTitleDelay: {
      type: Number,
      required: false,
      default: 500
    },
    secondaryDurations: {
      type: Number,
      required: false,
      default: 500
    },
    initialTransformX: {
      type: String,
      required: false,
      default: "50px"
    },
    finalTransformX: {
      type: String,
      required: false,
      default: "0px"
    },
    renderedOpacity: {
      type: Number,
      required: false,
      default: 1
    }
  },
  mounted: function() {
    this.realTimeAllocation();

    EventBus.$on("initiateController", computerName => {
      this.LoadControls(computerName);
    });

    EventBus.$on("connectedClients", parsedData => {
      this.userData = parsedData;
    });

    let vm = this;

    this._data.socketData.CurrentSocket.on("codeExecutionResponse", function(
      data
    ) {
      if (data.uniqueRoomNumber === vm._data.socketData.computerName) {
        vm.gotResponse = true;
        if (data.error) {
          new Notification("Error: Failed to run shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          vm.$Progress.fail();
          console.error("ERROR:\n", data.error);

          window.open(
            "https://suraj.codes/ASSETS/CLIENT/ORION/?ERROR=" +
              data.error.toString().replace(/\r?\n/g, "<__NEWLINE__>")
          );
        } else {
          new Notification("Success: Ran shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          vm.$Progress.finish();
          if (data.stdout === "" && data.stderr === "") return;

          console.log(
            "STDOUT:\n",
            data.stdout,
            "\nSTDERR:\n",
            data.stderr,
            "https://suraj.codes/ASSETS/CLIENT/ORION/?STDOUT=" +
              data.stdout.replace(/\r?\n/g, "<__NEWLINE__>") +
              "&STDERR=" +
              data.stderr.replace(/\r?\n/g, "<__NEWLINE__>")
          );

          window.open(
            "https://suraj.codes/ASSETS/CLIENT/ORION/?STDOUT=" +
              data.stdout.replace(/\r?\n/g, "<__NEWLINE__>") +
              "&STDERR=" +
              data.stderr.replace(/\r?\n/g, "<__NEWLINE__>")
          );
        }
      }
    });
  },
  methods: {
    realTimeAllocation: function() {
      this._data.socketData.CurrentSocket.on(
        "DisconnectionFromClient",
        uniqueIdentifier => {
          if (!uniqueIdentifier || uniqueIdentifier === null) return;

          for (let userInformation of this.userData) {
            if (userInformation.computerName === this.socketData.computerName) {
              this.controlFunctions.map(data => (data.enabled = false));
              this.deviceData.isConnected = false;
            }
          }
        }
      );
    },
    prepareExecution: function(identifier, eventElement, requiresInput) {
      if (!identifier.enabled) return;
      if (requiresInput) {
        let userInput = eventElement.target.parentElement.parentElement
          .getElementsByClassName("inputContainer")[0]
          .getElementsByTagName("input")[0].value;
        if (userInput !== "") {
          this._data.nessescaryFunctions.Store.setItem(
            identifier.functionName,
            userInput
          );
          this.gotResponse = false;
          this.$Progress.start();
          setTimeout(
            function() {
              if (this.gotResponse === false) this.$Progress.fail();
            }.bind(this),
            5000
          );
          identifier.function(this, userInput);
        } else {
          new Notification("Failed to call designated function", {
            body: "Input can not be blank"
          });
        }
      } else {
        this.gotResponse = false;
        this.$Progress.start();
        setTimeout(
          function() {
            if (this.gotResponse === false) this.$Progress.fail();
          }.bind(this),
          5000
        );
        identifier.function(this);
      }
    },
    LoadControls: function(computerName) {
      let divElement = this.$el;

      let configData = {
        primaryTitle: divElement
          .getElementsByClassName("connectedListTitle")[0]
          .getElementsByTagName("h2")[0],

        deviceCards: divElement
          .getElementsByClassName("mainContainerPicker")[0]
          .getElementsByClassName("devicePicker")[0]
          .getElementsByClassName("deviceCard"),
        props: this._props
      };

      divElement.style.zIndex = "5";

      this.deviceData.isConnected = true;
      this.deviceData.name = computerName;
      this.socketData.computerName = computerName;

      animateElements({
        targets: configData.primaryTitle,
        delay: configData.props.mainTitleDelay,
        opacity: configData.props.renderedOpacity,
        duration: configData.props.secondaryDurations / 2,
        translateX: [
          configData.props.initialTransformX,
          configData.props.finalTransformX
        ],
        easing: "easeOutCubic",
        begin: () =>
          animateElements({
            targets: configData.deviceCards,
            opacity: configData.props.renderedOpacity,
            duration: configData.props.secondaryDurations / 2,
            delay: function(_, currentKeyframe) {
              return (
                (currentKeyframe * configData.props.secondaryDurations) / 10
              );
            }
          })
      });
    }
  },
  data: () => {
    return {
      socketData: {
        CurrentSocket: SocketsIO("http://139.59.200.147:4001/")
      },
      deviceData: {
        isConnected: false,
        name: "<< AWAITING CONNECTION >>"
      },
      nessescaryFunctions: {
        Store: window.localStorage
      },
      controlFunctions: [
        {
          functionName: "Execute shell",
          requiresInput: true,
          placeHolder: "echo 'Hello world'",
          enabled: true,
          function: function(vm, shellCommand) {
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Shutdown",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `Stop-Computer`;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Restart",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `Restart-Computer`;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Max volume",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `
              $obj = new-object -com wscript.shell
              For ($i = 0; $i -lt 50; $i++){
                $obj.SendKeys([char]175)
                sleep 0.01
              }
            `;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Mute volume",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `
              $obj = new-object -com wscript.shell
              For ($i = 0; $i -lt 50; $i++){
                $obj.SendKeys([char]174)
                sleep 0.01
              }
            `;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Change background",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true,
          function(vm, URL) {
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isNode: true,
                Function: "ChangeBackground",
                Data: URL,
              }
            });
          }
        },
        {
          functionName: "Open URL",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true,
          function(vm, URL) {
            let shellCommand = `start ${URL}`;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Show open applications",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `gps | ? {$_.mainwindowhandle -ne 0} | select name, mainwindowtitle`;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Kill application",
          requiresInput: true,
          placeHolder: "chrome",
          enabled: true,
          function(vm, NAME) {
            let shellCommand = `Stop-Process -Name "${NAME}" -force`;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand,
              }
            });
          }
        },
        {
          functionName: "Set profile picture",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true
        },
        {
          functionName: "Send notification",
          requiresInput: true,
          placeHolder: "Hello World",
          enabled: true
        }
      ]
    };
  }
};
</script>

<style scoped lang="stylus">
  @import "./constants.styl"

  replicateGrid(pushedColour)
    .titleComponent
      display: flex
      justify-content: center

      h1
        justify-content: center
        font-family: 'Roboto', sans-serif;
        color: pushedColour

    .iconComponent
      display: flex
      justify-content: center

      .iconContainer
        background-color #e0f1f1
        width: 60px
        height: @width
        border-radius: @width
        transition: all 0.5s
        align-self: center

        .icon
          color: pushedColour
          font-size: @height
          transition: all 0.5s

     .iconAndInputComponent
       display: grid
       grid-template-columns: 4fr 1fr
       grid-gap: 25px
       padding-left: 25px

       .iconContainer
        background-color #e0f1f1
        width: 60px
        height: @width
        border-radius: @width
        transition: all 0.5s
        align-self: center

        .icon
          color: pushedColour
          font-size: @height
          transition: all 0.5s

       .inputContainer
         input
          width: 100%
          border: 0
          font-size: 2.5em;
          height: 100%
          border-radius: 3px
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2)
          transition: all 0.5s
          resize: none
          overflow: hidden

          &:hover
            box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.45)
            transition: all 0.5s

  .deviceControlContainer
    position: absolute
    height: 100%
    width: 100%
    z-index: -5
    display: grid
    height: 100%
    grid-template-columns: 100%
    grid-template-rows: 50px 1fr
    grid-gap: 20px 20px

    .connectedListTitle
      text-align: center

      h2
        font-family: 'Montserrat', sans-serif
        text-transform: uppercase
        color: lighten($colourConst.ShadeY.Primary, 15%)
        mix-blend-mode: difference
        font-weight: 300
        opacity: 0

        b
          font-weight: 700

  .mainContainerPicker
    overflow: scroll
    padding: 50px

    .devicePicker
      display: grid;
      align-self: center;
      justify-content: center;
      grid-template-columns: repeat(auto-fill, 225px);
      grid-auto-rows: 200px;
      grid-gap: 35px 35px;

      .expandCard
        grid-column: auto / span 2;

      .deviceCard
        border-radius: 15px;
        grid-column-start: auto;
        grid-row-start: auto;
        border: 2px solid white;
        opacity: 0;
        transition: all 0.25s;
        background-color: $colourConst.ShadeX.Primary
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 1fr 1fr 1fr

        .offlineTransform
          replicateGrid($colourConst.ShadeZ.LightRed)

        .onlineTransform
          replicateGrid($colourConst.ShadeZ.DarkBlue)

        &:hover
          .onlineTransform
            cursor: pointer

            .iconComponent
              .iconContainer
                transform: scale(1.15)
                transition: all 0.25s

                .icon
                  transition: @transition
                  color: darken($colourConst.ShadeZ.DarkBlue, 30%)
</style>
