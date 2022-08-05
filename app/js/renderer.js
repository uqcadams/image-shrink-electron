const path = require("path");
const os = require("os");
const fs = require("fs");
const { ipcRenderer } = require("electron");

const form = document.getElementById("image-form");
const currentFileSize = document.getElementById("currentFileSize");
const outputFileSize = document.getElementById("outputFileSize");
const imgUpload = document.getElementById("img");

document.getElementById("output-path").innerText = path.join(
  os.homedir(),
  "imageshrink"
);

// Listen for file upload
imgUpload.addEventListener("change", (e) => {
  const imgPath = img.files[0].path;
  // log file size
  fs.stat(imgPath, (err, stats) => {
    if (err) {
      currentFileSize.innerText = `No file selected.`;
    } else {
      currentFileSize.innerText = `${stats.size / 1000}kb`;
    }
  });
});

// ipcRenderer.on("image:outputFileSize", (e, message) => console.log(message));
ipcRenderer.on("image:outputFileSize", (e, message) => {
  console.log("triggered");
  if (message) {
    outputFileSize.innerText = `${message}kb`;
    console.log("no error");
  } else {
    outputFileSize.innerText = `Output error`;
    console.log("error");
  }
});

// Form on submit event listener
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Electron adds a path property to file objects; this is only possible due to electron's node integration
  const imgPath = img.files[0].path;
  const quality = slider.value;

  ipcRenderer.send("image:minimize", {
    imgPath,
    quality,
  });

  // On done
  ipcRenderer.on("image:done", () => {
    M.toast({
      html: `Image resized to ${slider.value}% quality`,
    });
  });
});
