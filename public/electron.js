const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { menu } = require("./menu");
const config = require("electron-json-config").factory();

let mainWindow;
const isWindows = process.platform === "win32";

app.on("ready", async () => {
  const options = Object.assign(
    {
      width: 1366,
      height: 768,
      icon: `${__dirname}/images/logo/snip_command.png`,
      titleBarStyle: "hidden",
      backgroundColor: "#fff",
      frame: !isWindows,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    },
    config.get("winBounds")
  );

  mainWindow = new BrowserWindow(options);

  mainWindow
    .loadURL(
      isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    )
    .then((r) => r);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("close", (e) => {
    config.set("winBounds", mainWindow.getBounds());
  });

  mainWindow.on("closed", (e) => {
    mainWindow = null;
  });
});

app.disableHardwareAcceleration();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.on('activate', () => {
//     if (mainWindow === null) {
//         createWindow();
//     }
// });

ipcMain.handle(`display-app-menu`, (e, args) => {
  if (isWindows && mainWindow) {
    menu.popup({ window: mainWindow, x: args.x, y: args.y });
  }
});
