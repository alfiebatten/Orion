<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Title/Title.png" alt="Orion Logo"/>
</p>

<div align="center">
  <a href="https://api.codeclimate.com/v1/badges/03b7dfafbbf28b6fe8e4/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/03b7dfafbbf28b6fe8e4/maintainability" alt="Maintainability" height="18">
  </a>
  <a href="https://david-dm.org/O-Y/Orion.svg">
    <img src="https://david-dm.org/O-Y/Orion.svg" alt="Dependencies" height="18">
  </a>
  <a href="https://badge.fury.io/gh/o-y%2Forion.svg">
    <img src="https://badge.fury.io/gh/o-y%2Forion.svg" alt="GitHub version" height="18">
  </a>
</div>

<p align="center">
  In Greek mythology, Orion, son of Poseidon was a giant huntsman whom Zeus placed among the stars as the constellation of Orion. This project has been named Orion to symbolize the connectivity and impending, sentinel like watch the app imposes on the client.
  Orion consists of three parts, the Client, the Host and the Server. The client runs on the targets computer, silent and unobtrusive - designed to stay hidden with minimal resource impact. The host runs as an app on the hosts computer, a sleek interface filled with time saving features, allows for an intuitive framework, giving the host access over the given client. The server acts as a middleware for both the client and the host - using the JavaScript library Sockets.io means the host can view in real time what clients are connected. Using notifications the host is alerted when a client connects and disconnects.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Title/Screenshot.png" alt="Screenshot" height="150px"/>
</p>

#### Home screen component

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Window/HomeWindow.png" alt="Screenshot of connected clients window"/>
</p>


#### Connected clients component

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Window/ConnectedWindow.png" alt="Screenshot of connected clients window"/>
</p>

#### Control screen component

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Window/ControlWindow.png" alt="Screenshot of connected clients window"/>
</p>

#### Control screen component with response from client

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Window/Response.png" alt="Screenshot of connected clients window with response"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Title/Installation.png" alt="Installation" height="150px"/>
</p>

#### Installation
```
Installs the required dependencies
yarn install / npm install
```

#### Initiate Vue UI
```
Starts up the Vue UI on a local server. The cli-ui exposes an API that allows augmenting the project configurations and tasks, as well as sharing data and communicating with other processes.
vue ui
```

#### Serve
```
Locally serves the app on a development server initiating an Electron app compiled with Vue dev tools using the package electron-builder
yarn serve:electron / npm run serve:electron
```

#### Build
```
Packages the app, downloads the required Electron assets and then compiles into the given file type for the OS. Defaults to your current OS
yarn run serve:build
```

#### Lint
```
Lints JavaScript/Vue files, returning any relevant errors or warnings
yarn run lint
```

#### Postinstall
```
Installs required app dependencies
electron-builder install-app-deps
```
