const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "./truck2.png";   //base truck image path

img.onload = function () {
  resizeCanvas();
  generateImage();
};

window.addEventListener("resize", resizeCanvas);

// ---------- Canvas Resize with DPR Fix ----------
function resizeCanvas() {
  const ratio = img.width / img.height;
  const previewBox = document.querySelector(".preview-box");

  let displayWidth = previewBox.clientWidth - 20;
  if (displayWidth < 320) displayWidth = 320;
  let displayHeight = displayWidth / ratio;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
}

// ---------- Draw Image + Text ----------
function generateImage() {
  resizeCanvas();
  const slogan = document.getElementById("slogan").value.trim();
  ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
  if (slogan) wrapText(slogan);
}

// ---------- Text Wrapping Inside Blank Panel ----------
function wrapText(text) {
  const displayWidth = parseFloat(canvas.style.width);
  const displayHeight = parseFloat(canvas.style.height);

  // Panel box position tuned for your truck image
  const boxLeft   = displayWidth * 0.3;
  const boxRight  = displayWidth * 0.7;
  const boxTop    = displayHeight * 0.45;
  const boxBottom = displayHeight * 0.615;

  const boxWidth = boxRight - boxLeft;
  const boxHeight = boxBottom - boxTop;

  let fontSize = displayWidth * 0.04;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  function buildLines() {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);

      if (metrics.width > boxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  }

  let lines = buildLines();
  let lineHeight = fontSize * 1.25;

  // Auto shrink if too tall
  while (lines.length * lineHeight > boxHeight) {
    fontSize *= 0.92;
    ctx.font = `bold ${fontSize}px Arial`;
    lineHeight = fontSize * 1.2;
    lines = buildLines();
  }

  const totalHeight = lines.length * lineHeight;
  const startY = boxTop + (boxHeight - totalHeight) / 2 + fontSize;
  const centerX = boxLeft + boxWidth / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, startY + i * lineHeight);
  }
}

// ---------- Toast ----------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ---------- Button Handler ----------
function handleGenerate() {
  const btn = document.getElementById("generateBtn");
  if (btn.disabled) return;

  btn.disabled = true;
  btn.innerText = "Generating...";

  processDownload().finally(() => {
    btn.disabled = false;
    btn.innerText = "Generate & Download";
  });
}

// ---------- Main Processing ----------
async function processDownload() {
  const employeeCodeInput = document.getElementById("employeeCode");
  const sloganInput = document.getElementById("slogan");

  const employeeCode = employeeCodeInput.value.trim();
  const slogan = sloganInput.value.trim();

  // Validations
  if (!employeeCode || !slogan) {
    showToast("Please fill all fields‼️");
    return;
  }

  if (!/^\d{6}$/.test(employeeCode)) {
    showToast("Employee code must be exactly 6 digits‼️");
    return;
  }

  // Always redraw fresh canvas
  generateImage();

  // Store in Google Sheet
  storeData(employeeCode, slogan);

  // Wait for canvas render
  await new Promise(resolve => setTimeout(resolve, 150));

  // Download image
  const link = document.createElement("a");
  link.download = "Baxter_Road_Safety_Slogan.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  showToast("Image downloaded successfully ✅");

  // ✅ Clear inputs for next entry
  employeeCodeInput.value = "";
  sloganInput.value = "";

  // ✅ Reset canvas to blank truck after download
  generateImage();
}

// ---------- Send to Google Apps Script ----------
function storeData(employeeCode, slogan) {
  fetch("https://script.google.com/macros/s/AKfycbzI4tSiouGxfLxiEaKPJC3DpbHvlZg4aohchEd_3z-VT0vC0jnrOse8Oa0QNh98HRVHiA/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      employeeCode: employeeCode,
      slogan: slogan
    })
  }).catch(err => console.error("Sheet error:", err));
}
