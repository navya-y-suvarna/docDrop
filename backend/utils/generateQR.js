const QRCode = require("qrcode");

async function generateQR(data) {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 250,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("❌ QR generation error:", err);
    return null;
  }
}

module.exports = {
  generateQR,
};
