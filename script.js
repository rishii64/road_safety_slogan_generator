const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "truck.jpeg";

function resizeCanvas() {
  const ratio = img.width / img.height;
  let width = window.innerWidth * 0.5;
  if (window.innerWidth <= 600)
    width = window.innerWidth * 0.95;
  canvas.width = width;
  canvas.height = width / ratio;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

img.onload = resizeCanvas;
window.onresize = resizeCanvas;

function generateImage() {
  resizeCanvas();
  const text = document.getElementById("slogan").value;
  const charCount = text.length;
  if (charCount > 20) {
    window.alert("charater must be less than 11 characters");
  }
  else {
    let conversionRate = 0.04
    if(charCount > 11)
      conversionRate = 0.025;
    ctx.font = `bold ${canvas.width * conversionRate}px Arial`;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    wrapText(text, canvas.width / 2, canvas.height * 0.57, canvas.width * 0.28, canvas.width * 0.05);
  }
}

// function generateImage() {
//   resizeCanvas();

//   const text = document.getElementById("slogan").value.trim();
//   const charCount = text.length;

//   // Base font size relative to canvas width
//   let baseFontSize = canvas.width * 0.04;

//   // Reduce font size if text exceeds 11 characters
//   if (charCount > 11) {
//     const reductionFactor = Math.min((charCount - 11) * 0.0025, 0.02);
//     baseFontSize = baseFontSize * (1 - reductionFactor);
//   }

//   ctx.font = `bold ${baseFontSize}px Arial`;
//   ctx.fillStyle = "black";
//   ctx.textAlign = "center";
//   ctx.textBaseline = "middle";

//   wrapText(
//     text,
//     canvas.width / 2,
//     canvas.height * 0.56,
//     canvas.width * 0.7,
//     baseFontSize * 1.3
//   );
// }


function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    let metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function downloadImage() {
  const name = document.getElementById("name").value.trim();
  console.log("🚀 ~ downloadImage ~ name:", name)
  const employeeCode = document.getElementById("employeeCode").value.trim();
  console.log("🚀 ~ downloadImage ~ employeeCode:", employeeCode)
  const slogan = document.getElementById("slogan").value.trim();
  console.log("🚀 ~ downloadImage ~ slogan:", slogan)

  if (!name || !employeeCode || !slogan) {
    alert("Please fill all fields");
    return;
  }

  // 1. Store data in Google Sheet
  storeData(name, employeeCode, slogan);

  // 2. Download image
  const link = document.createElement("a");
  link.download = "road_safety_slogan.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}


function storeData(name, employeeCode, slogan) {
  fetch("https://script.google.com/macros/s/AKfycby5wVHLC3ZunW1pW7xGcw8z1-g2-dHdwvxYM3pfH6851T33Hale9GOcnQtxcJi8aoY/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      employeeCode: employeeCode,
      slogan: slogan
    })
  }).catch(err => console.error("Sheet error:", err));
}

