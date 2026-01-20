const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "./truck2.png";

function resizeCanvas() {
  const ratio = img.width / img.height;
  const previewBox = document.querySelector(".preview-box");

  let displayWidth = previewBox.clientWidth - 30;
  if (displayWidth < 300) displayWidth = 300;
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

img.onload = resizeCanvas;
window.onresize = resizeCanvas;

/* =========================   MAIN HANDLER   ========================= */
function handleGenerateDownload() {
  const employeeCode = document.getElementById("employeeCode").value.trim();
  const slogan = document.getElementById("slogan").value.trim();

  // --- Validation ---
  if (!employeeCode && !slogan) {
    showToast("Please fill all fields‼️");
    return;
  }

  if (!employeeCode) {
    showToast("Enter Employee Code‼️");
    return;
  }

  if (employeeCode.length !== 6 || isNaN(employeeCode)) {
    showToast("Enter valid 6-digit employee code❗");
    return;
  }

  if (!slogan) {
    showToast("Enter a Slogan‼️");
    return;
  }

  if (slogan.length > 101) {
    showToast("Slogan must be about 100 characters❗");
    return;
  }

  // --- Passed validation ---
  showToast("Success ✅");

  // --- Render Image with Text ---
  resizeCanvas();
  wrapText(slogan);

  // --- Store + Download after short delay ---
  setTimeout(() => {
    storeData(employeeCode, slogan);
    downloadCanvasImage();

    // Clear inputs only after success
    document.getElementById("employeeCode").value = "";
    document.getElementById("slogan").value = "";
  }, 500);
}

/* =========================   TEXT RENDERING (UNCHANGED LOGIC)   ========================= */
function wrapText(text) {
  const displayWidth = parseFloat(canvas.style.width);
  const displayHeight = parseFloat(canvas.style.height);

  const boxLeft = displayWidth * 0.3;
  const boxRight = displayWidth * 0.7;
  const boxTop = displayHeight * 0.45;
  const boxBottom = displayHeight * 0.615;

  const boxWidth = boxRight - boxLeft;
  const boxHeight = boxBottom - boxTop;

  let fontSize = displayWidth * 0.040;
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
  while ((lines.length * lineHeight) > boxHeight) {
    fontSize *= 0.82;
    ctx.font = `bold ${fontSize}px Arial`;
    lineHeight = fontSize * 1.2;
    lines = buildLines();
  }

  const totalTextHeight = lines.length * lineHeight;
  let startY = boxTop + (boxHeight - totalTextHeight) / 2 + fontSize;
  const centerX = boxLeft + (boxWidth / 2);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, startY + (i * lineHeight));
  }
}

/* =========================   DOWNLOAD   ========================= */
function downloadCanvasImage() {
  const link = document.createElement("a");
  link.download = "Baxter_road_safety_slogan.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* =========================   TOAST    ========================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =========================   DATA STORAGE     ========================= */
function storeData(employeeCode, slogan) {
  fetch("https://script.google.com/macros/s/AKfycbzI4tSiouGxfLxiEaKPJC3DpbHvlZg4aohchEd_3z-VT0vC0jnrOse8Oa0QNh98HRVHiA/exec", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ employeeCode, slogan })
  }).catch(err => console.error("Sheet error:", err));
}
