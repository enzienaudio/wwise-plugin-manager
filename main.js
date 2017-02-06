'use strict';

// var client = require("electron-connect").client;
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

app.on('window-all-closed', function () {
  app.quit();
});


app.on('ready', function () {
  var mainWindow = new BrowserWindow({});

  // client.create(mainWindow);
  mainWindow.toggleDevTools();
  mainWindow.loadURL('file://' + __dirname + '/index.html');
});
