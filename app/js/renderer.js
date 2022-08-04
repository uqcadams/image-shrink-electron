const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");

const form = document.getElementById("image-form");

document.getElementById("output-path").innerText = path.join(
  os.homedir(),
  "imageshrink"
);

// Onsubmit
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
