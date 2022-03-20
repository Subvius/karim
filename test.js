var QRCode = require("qrcode");

QRCode.toFile(
  "Assets/QR codes/filename.png",
  "Денис лох",
  {
    color: {
      dark: "#000", // Blue dots
      light: "#FFFF", // Transparent background
    },
  },
  function (err) {
    if (err) throw err;
    console.log("done");
  }
);
