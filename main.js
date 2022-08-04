// Require core node modules
const path = require("path");
const os = require("os");

// Require the electron module
const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
  screen,
} = require("electron");

// Require dependencies
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const slash = require("slash"); // handles forward slash conversion on windows
const { electron } = require("process");
const log = require("electron-log");

// PRODUCTION v DEVELOPMENT SETINGS
process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

// Defined in global scope to enable global access
let mainWindow;
let aboutWindow;

// Empty variable to capture dimensions of main screen
let mainScreen;

/**
 * Create new browser window
 * Creates a new window object for the GUI.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Chris's Electron App",
    width: isDev ? 415 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/treehouselogo-main.png`,
    resizable: isDev ? true : false,
    backgroundColor: "hsla(230, 50%, 50%,0.5)",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    x: 0,
    y: mainScreen.size.height,
  });

  // mainWindow.loadURL("https://twitter.com");
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  // loadFile and loadURL will achieve same outcome
  // mainWindow.loadFile("./app/index.html");
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

/**
 * Create about window
 * Creates a new window object for the GUI.
 */
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About ImageShrink",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/treehouselogo-main.png`,
    resizable: false,
    backgroundColor: "white",
  });

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

// Window launch and exit configurations / event listeners

// Create new GUI window when ready event occurs
app.on("ready", () => {
  // Captures primary screen dimensions on 'ready' event
  mainScreen = screen.getPrimaryDisplay();

  // Creates main window GUI
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );
  globalShortcut.register("CmdOrCtrl+Q", () => app.quit());

  mainWindow.on("ready", () => (mainWindow = null));
});

// // Defining menu / toolbar settings
// const menu = [
//   ...(isMac ? [{ role: "appMenu" }] : []),
//   {
//     label: "File",
//     submenu: [
//       {
//         label: "Quit", // label describes behaviour
//         // accelerator: isMac ? "Command+W" : "Ctrl+W",
//         accelerator: "CmdOrCtrl+w", // shortcut
//         click: () => app.quit(), // on-click functionality
//       },
//     ],
//   },
// ];

// Defining menu / toolbar settings
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { role: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
];

ipcMain.on("image:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageshrink");
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({ quality: [pngQuality, pngQuality] }),
      ],
    });

    log.info(files);
    shell.openPath(dest);

    mainWindow.webContents.send("image:done");
  } catch (err) {
    log.error(err);
  }
}

// Account for variations between operating systems
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

// Control window creation (Mac)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
