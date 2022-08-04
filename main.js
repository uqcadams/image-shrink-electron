// Require the electron module
const { app, BrowserWindow, Menu, globalShortcut } = require("electron");

// PRODUCTION v DEVELOPMENT SETINGS
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

// Defined in global scope to enable global access
let mainWindow;
let aboutWindow;

/**
 * Create new browser window
 * Creates a new window object for the GUI.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Chris's Electron App",
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: "white",
  });

  // mainWindow.loadURL("https://twitter.com");
  mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  // loadFile and loadURL will achieve same outcome
  // mainWindow.loadFile("./app/index.html");
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
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: "white",
  });

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
}

// Window launch and exit configurations / event listeners

// Create new GUI window when ready event occurs
app.on("ready", () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
  globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+I", () =>
    mainWindow.toggleDevTools()
  );

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

// if (isMac) {
//   menu.unshift({ role: "appMenu" });
// }

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
