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
          v-bind:class = "[controlOptions.requiresInput ? controlOptions.inputAmounts && controlOptions.inputAmounts > 1 ? 'expandCard-3' : 'expandCard-2' : '']"
        >
          <div
            v-bind:class = "[controlOptions.enabled && controlOptions.function ? 'onlineTransform' : 'offlineTransform']"
          >
            <div class = "titleComponent">
              <h1>{{ controlOptions.functionName }}</h1>
            </div>

            <div v-if = "controlOptions.requiresInput" class = "iconAndInputComponent">
              <div class = "inputContainer">
                <template v-if="controlOptions.inputAmounts > 1">
                  <input
                    v-bind:placeholder = "controlOptions.placeHolderPrimary"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName + '_PRIMARY')"
                    style = "width: 50% !important"
                  >
                  <input
                    v-bind:placeholder = "controlOptions.placeHolderSecondary"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName + '_SECONDARY')"
                    style = "width: 49% !important; margin-left: 1%"
                  >
                </template>
                <template v-else>
                  <input
                    v-bind:placeholder = "controlOptions.placeHolder"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName)"
                  >
                </template>
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
import animateElements from "animejs"
import { EventBus } from "../eventBus.js"
import SocketsIO from "socket.io-client"
import vueAlert from 'sweetalert'
import codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

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
        vm.$Progress.finish();

        [...document.getElementsByClassName("CodeMirror")].map(
          element => element.remove()
        );

        if (data.error) {
          new Notification("Error: Failed to run shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          let ERROR = data.error.replace(/\r?\n/g, "\n\r")

          let codeElement = document.createElement("textarea")
          codeElement.innerHTML = `ERROR:\n${ERROR}`
          document.body.appendChild(codeElement)

          codemirror.fromTextArea(codeElement, {
            lineNumbers: true,
            theme: 'monokai'
          })

          let codeMirrorElement = document.getElementsByClassName("CodeMirror")[0]
          codeMirrorElement.style.textAlign = "left"

          vueAlert({
            content: codeMirrorElement
          })

          let swalModal = document.getElementsByClassName("swal-modal")[0]
          swalModal.style.backgroundColor = "#e74c3c"

          let codeMirrorGutter = document.getElementsByClassName("CodeMirror-gutters")[0]
          codeMirrorGutter.style.backgroundColor = "#e74c3c"

          let codeMirrorWindow = document.getElementsByClassName("CodeMirror")[0]
          codeMirrorWindow.style.backgroundColor = "#e74c3c"
        } else {
          new Notification("Success: Ran shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/ASSETS/CLIENT/IMAGES/ORION/1024x1024.png"
          });

          if (data.stdout === "" && data.stderr === "") return;

          let STDOUT = data.stdout.replace(/\r?\n/g, "\n\r")
          let STDERR = data.stderr.replace(/\r?\n/g, "\n\r")

          let codeElement = document.createElement("textarea")
          codeElement.innerHTML = `STDOUT:\n${STDOUT}\n\nSTDERR:\n${STDERR}`
          document.body.appendChild(codeElement)

          codemirror.fromTextArea(codeElement, {
            lineNumbers: true,
            theme: 'monokai'
          });

          let codeMirrorElement = document.getElementsByClassName("CodeMirror")[0]
          codeMirrorElement.style.textAlign = "left"

          vueAlert({
            content: codeMirrorElement
          });

          let swalModal = document.getElementsByClassName("swal-modal")[0]
          swalModal.style.backgroundColor = "#272822"
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
        if (eventElement.target.parentElement.parentElement.getElementsByClassName("inputContainer")[0].getElementsByTagName("input").length > 1){
          let primaryInput = eventElement.target.parentElement.parentElement
            .getElementsByClassName("inputContainer")[0]
            .getElementsByTagName("input")[0].value

          let secondaryInput = eventElement.target.parentElement.parentElement
            .getElementsByClassName("inputContainer")[0]
            .getElementsByTagName("input")[1].value

          if (primaryInput !== "" || secondaryInput !== "") {
            this._data.nessescaryFunctions.Store.setItem(
              identifier.functionName + "_PRIMARY",
              primaryInput,
            );

            this._data.nessescaryFunctions.Store.setItem(
              identifier.functionName + "_SECONDARY",
              secondaryInput,
            );

            this.gotResponse = false;
            this.$Progress.start();
            setTimeout(
              function() {
                if (this.gotResponse === false) this.$Progress.fail();
              }.bind(this),
              5000
            );
            identifier.function(this, primaryInput, secondaryInput);
          } else {
            new Notification("Failed to call designated function", {
              body: "Input can not be blank"
            });
          }
        } else {
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
      isKeyboardActive: false,
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
          functionName: "Show apps",
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
          functionName: "Simulate keyboard",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let keyBoard = document.createElement("div")
            keyBoard.className = "simple-keyboard"
            document.body.appendChild(keyBoard)

            function onKeyPress(button) {
              if (vm.isKeyboardActive === false) return
              return vm.socketData.CurrentSocket.emit("transmitToClients", {
                auth: "B3GHU8",
                computerName: vm.socketData.computerName,
                functionName: this.functionName,
                internalCall: {
                  isNode: true,
                  Function: "simulateKeyboard",
                  Data: button,
                }
              });
            }

            vm.isKeyboardActive = true
            vueAlert({
              content: keyBoard
            }).then( (closed) => {
              vm.isKeyboardActive = false
            })

            let vueKeyboard = new Keyboard({
              onKeyPress: button => onKeyPress(button),
              physicalKeyboardHighlight: true
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
        },
        {
          functionName: "Download file",
          requiresInput: true,
          inputAmounts: 2,

          placeHolderPrimary: "URL",
          placeHolderSecondary: "Path",

          enabled: true,
          function: function(vm, URL, PATH) {
            console.log(vm, URL, PATH)
            let shellCommand = `
            $url = "${URL}"
            $output = "${PATH}"
            $start_time = Get-Date

            Import-Module BitsTransfer
            Start-BitsTransfer -Source $url -Destination $output

            Write-Output "Time taken: $((Get-Date).Subtract($start_time).Seconds) second(s)"
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
          functionName: "Open file",
          requiresInput: true,
          placeHolder: "Path",
          enabled: true,
          function(vm, PATH) {
            let shellCommand = `Invoke-Item "${PATH}; echo Opened file: ${PATH}"`;
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
        text-align: center
        font-family: 'Roboto', sans-serif
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

      .expandCard-2
        grid-column: auto / span 2;

      .expandCard-3
        grid-column: auto / span 3;

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
