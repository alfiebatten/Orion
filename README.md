<p align="center">
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Title/Asset%201-8-Dark.png" alt="Orion Logo"/>
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
  <img src="https://raw.githubusercontent.com/o-y/Orion/master/git_assets/Window/ConnectedWindow.png" alt="Screenshot of connected clients window"/>
</p>

#### Setup
vue ui

#### Serve
vue-cli-service serve

#### Build
vue-cli-service build

#### Lint
vue-cli-service lint

#### Build:electron
vue-cli-service build:electron

#### Serve:electron
vue-cli-service serve:electron

#### Postinstall
electron-builder install-app-deps
