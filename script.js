const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "./truck2.png";

function resizeCanvas() {
  const ratio = img.width / img.height;
  const previewBox = document.querySelector(".preview-box");

  // CSS display size
  let displayWidth = previewBox.clientWidth - 30;
  if (displayWidth < 300) displayWidth = 300;
  let displayHeight = displayWidth / ratio;

  // Get device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // Set canvas internal resolution scaled for DPR
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  // Set canvas CSS display size
  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";

  // Reset transform before scaling
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Improve scaling quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw base image
  ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
}

img.onload = resizeCanvas;
window.onresize = resizeCanvas;

function generateImage() {
  resizeCanvas();
  const text = document.getElementById("slogan").value.trim();
  const charCount = text.length;

  if (charCount > 50) {
    window.alert("Character must be less than 50..❗");
    return;
  }
  wrapText(text);
}

function wrapText(text) {
  // --- Always work in CSS pixel coordinates ---
  const displayWidth = parseFloat(canvas.style.width);
  const displayHeight = parseFloat(canvas.style.height);

  // --- Blank panel bounding box in CSS space ---
  const boxLeft = displayWidth * 0.3;
  const boxRight = displayWidth * 0.7;
  const boxTop = displayHeight * 0.45;
  const boxBottom = displayHeight * 0.615;

  const boxWidth = boxRight - boxLeft;
  const boxHeight = boxBottom - boxTop;

  // --- Base font size in CSS pixels ---
  let fontSize = displayWidth * 0.040;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  // --- Build wrapped lines ---
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

  // --- Shrink font if total height exceeds panel ---
  let lineHeight = fontSize * 1.25;
  while ((lines.length * lineHeight) > boxHeight) {
    fontSize *= 0.82;
    ctx.font = `bold ${fontSize}px Arial`;
    lineHeight = fontSize * 1.2;
    lines = buildLines();
  }

  // --- Center inside box ---
  const totalTextHeight = lines.length * lineHeight;
  let startY = boxTop + (boxHeight - totalTextHeight) / 2 + fontSize;
  const centerX = boxLeft + (boxWidth / 2);

  // --- Draw ---
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], centerX, startY + (i * lineHeight));
  }
}

function downloadImage() {
  const employeeCode = document.getElementById("employeeCode").value.trim();
  const slogan = document.getElementById("slogan").value.trim();

  if (!employeeCode & !slogan) {
    showToast("Please fill all fields‼️");
    return;
  }
  else if (!employeeCode) {
    showToast("Enter Employee Code‼️")
  }
  else if (employeeCode.length !== 6) {
    showToast("Enter valid 6-digit employee code❗");
    return;
  }
  else if (!slogan) {
    showToast("Enter a Slogan ‼️")
  }

  showToast("Success ✅")

  // Run once after short delay
  setTimeout(() => {
    // Store in Google Sheet
    storeData(employeeCode, slogan);

    // Download Image
    const link = document.createElement("a");
    link.download = "Baxter_road_safety_slogan.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Optional: Clear inputs after successful download
    document.getElementById("employeeCode").value = "";
    document.getElementById("slogan").value = "";
  }, 800);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

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
  console.log('stored');
}

// fetch("https://script.google.com/macros/s/AKfycbwT7ZGUv6BoX2mvVw48TwHVAKA9Iw5qi81TQXP3VLM_-pJEhKZxDImzat6Z3XpELIhR/exec", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded"
//   },
//   body: new URLSearchParams({
//     name: "Test User",
//     employeeCode: "EMP001",
//     slogan: "Safety First"
//   })
// })
// .then(res => res.text())
// .then(txt => console.log("Response:", txt))
// .catch(err => console.error(err));
