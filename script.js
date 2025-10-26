// browser JS: no require()
const startButton = document.getElementById("startButton");
const resultsLog = document.getElementById("results");
const dlProgress = document.getElementById("dlProgress");
const dlSpeedEl = document.getElementById("dlSpeed");
const dlReceivedEl = document.getElementById("dlReceived");
const pcIpEl = document.getElementById("pcIp");
const copyIpButton = document.getElementById("copyIpButton");
const analysisSection = document.getElementById("analysisSection");
const generateAnalysisButton = document.getElementById("generateAnalysis");
const internetDlInput = document.getElementById("internetDl");
const internetUlInput = document.getElementById("internetUl");
const analysisDiv = document.getElementById("analysis");

let localDownloadSpeed = 0;
let localUploadSpeed = 0;

function log(message) {
  console.log(message);
  resultsLog.textContent += message + "\n";
}

async function startTest() {
  log("Starting Speed Test...");
  startButton.disabled = true;
  resultsLog.textContent = ""; // clear previous results

  try {
    // Ping Test
    log("Testing Ping...");
    let totalPingTime = 0;
    const pingCount = 10;
    for (let i = 0; i < pingCount; i++) {
      const startTime = Date.now();
      await fetch("/ping", { cache: "no-store" });
      totalPingTime += Date.now() - startTime;
    }
    const avgPing = (totalPingTime / pingCount).toFixed(2);
    log(`Average Ping: ${avgPing} ms`);

    // Download Test (real-time progress updates)
    log("Testing Download Speed...");
    const dlSizeMB = 100; // keep parity with server default
    const dlUrl = `/download?size=${dlSizeMB}&_=${Date.now()}`;

    const dlStartTime = Date.now();
    const dlResponse = await fetchWithTimeout(
      dlUrl,
      { cache: "no-store" },
      30000
    );
    if (!dlResponse.ok)
      throw new Error(`Download failed: ${dlResponse.status}`);

    const contentLengthHeader = dlResponse.headers.get("Content-Length");
    const totalBytesExpected = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : dlSizeMB * 1024 * 1024;

    const reader = dlResponse.body.getReader();
    let bytesReceived = 0;

    // per-second reporting
    let secondBytes = 0;
    let lastReportTime = Date.now();

    dlProgress.max = totalBytesExpected;
    dlProgress.value = 0;

    function reportSpeed() {
      const now = Date.now();
      const delta = (now - lastReportTime) / 1000 || 1;
      const bps = (secondBytes * 8) / delta; // bits per second
      const mbps = (bps / (1000 * 1000)).toFixed(2);
      dlSpeedEl.textContent = `Speed: ${mbps} Mbps`;
      dlReceivedEl.textContent = `Received: ${formatBytes(bytesReceived)}`;
      secondBytes = 0;
      lastReportTime = now;
    }

    const perSecondInterval = setInterval(reportSpeed, 1000);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesReceived += value.length;
        secondBytes += value.length;
        dlProgress.value = Math.min(bytesReceived, totalBytesExpected);
      }
    } finally {
      clearInterval(perSecondInterval);
      // final report
      const dlTimeInSeconds = (Date.now() - dlStartTime) / 1000;
      const dlSpeedMbps = (
        (bytesReceived * 8) /
        (dlTimeInSeconds * 1000 * 1000)
      ).toFixed(2);
      dlSpeedEl.textContent = `Speed: ${dlSpeedMbps} Mbps`;
      dlReceivedEl.textContent = `Received: ${formatBytes(bytesReceived)}`;
      log(`Download Speed: ${dlSpeedMbps} Mbps`);
      localDownloadSpeed = parseFloat(dlSpeedMbps);
    }

    // Upload Test
    log("Testing Upload Speed...");
    const ulTestSize = 50 * 1024 * 1024; // 50 MB
    const ulDummyData = new Uint8Array(ulTestSize).fill(0);
    const ulStartTime = Date.now();

    await fetch("/upload", {
      method: "POST",
      body: ulDummyData,
      cache: "no-store",
    });

    const ulTimeInSeconds = (Date.now() - ulStartTime) / 1000;
    const ulSpeedMbps = (
      (ulTestSize * 8) /
      (ulTimeInSeconds * 1000 * 1000)
    ).toFixed(2);
    log(`Upload Speed: ${ulSpeedMbps} Mbps`);
    localUploadSpeed = parseFloat(ulSpeedMbps);
  } catch (error) {
    log(`Error occurred: ${error.message}`);
  } finally {
    log("Test completed. ");
    analysisSection.style.display = "block";
    startButton.disabled = false;
  }
}

startButton.onclick = startTest;

generateAnalysisButton.onclick = generateAnalysis;

function generateAnalysis() {
  const internetDl = parseFloat(internetDlInput.value);
  const internetUl = parseFloat(internetUlInput.value);
  if (isNaN(internetDl) || isNaN(internetUl)) {
    analysisDiv.innerHTML =
      '<p style="color: red;">Please enter valid internet speeds.</p>';
    return;
  }

  let analysis = "<h3>Network Analysis Report</h3>";

  const dlBottleneck = localDownloadSpeed < internetDl ? "WiFi" : "Internet";
  const ulBottleneck = localUploadSpeed < internetUl ? "WiFi" : "Internet";

  analysis += `<p><strong>Your Results:</strong></p>`;
  analysis += `<ul>`;
  analysis += `<li>Local Download: ${localDownloadSpeed} Mbps</li>`;
  analysis += `<li>Local Upload: ${localUploadSpeed} Mbps</li>`;
  analysis += `<li>Internet Download: ${internetDl} Mbps</li>`;
  analysis += `<li>Internet Upload: ${internetUl} Mbps</li>`;
  analysis += `</ul>`;

  if (dlBottleneck === "WiFi" && localDownloadSpeed < internetDl) {
    analysis += `<p>🔴 <strong>Download Issue:</strong> Your WiFi is slower than your internet (${localDownloadSpeed} vs ${internetDl} Mbps). You're losing ${(
      internetDl - localDownloadSpeed
    ).toFixed(2)} Mbps!</p>`;
  } else {
    analysis += `<p>✅ <strong>Download:</strong> WiFi is fine (${localDownloadSpeed} Mbps, internet ${internetDl} Mbps).</p>`;
  }

  if (ulBottleneck === "WiFi" && localUploadSpeed < internetUl) {
    analysis += `<p>🔴 <strong>Upload Issue:</strong> Your WiFi is slower than your internet (${localUploadSpeed} vs ${internetUl} Mbps).</p>`;
  } else {
    analysis += `<p>✅ <strong>Upload:</strong> WiFi is fine (${localUploadSpeed} Mbps, internet ${internetUl} Mbps).</p>`;
  }

  analysis += `<p><strong>Recommendations:</strong></p>`;
  if (dlBottleneck === "WiFi" || ulBottleneck === "WiFi") {
    analysis += `<ul>`;
    analysis += `<li>Try switching to 5GHz WiFi band if available.</li>`;
    analysis += `<li>Check for WiFi interference or move closer to router.</li>`;
    analysis += `<li>Consider upgrading your router if it's old.</li>`;
    analysis += `</ul>`;
  } else {
    analysis += `<p>Your WiFi is performing well! No issues detected.</p>`;
  }

  analysisDiv.innerHTML = analysis;
}

// helper: format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// fetch with timeout using AbortController
async function fetchWithTimeout(resource, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return resp;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Network timeout");
    throw err;
  } finally {
    clearTimeout(id);
  }
}

// get PC IP from server and wire up copy button
async function fetchAndShowIp() {
  try {
    const resp = await fetch("/ip", { cache: "no-store" });
    if (!resp.ok) throw new Error("Failed to get IP");
    const data = await resp.json();
    const ip = data.ip || "(unknown)";
    pcIpEl.textContent = ip;
    copyIpButton.disabled = ip === "(unknown)";
    copyIpButton.onclick = async () => {
      const url = `http://${ip}:${location.port}`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
        copyIpButton.textContent = "Copied!";
        setTimeout(() => (copyIpButton.textContent = "Copy IP"), 1500);
      } catch (e) {
        console.error("Copy failed:", e);
        copyIpButton.textContent = "Copy Failed";
        setTimeout(() => (copyIpButton.textContent = "Copy IP"), 1500);
      }
    };
  } catch (err) {
    pcIpEl.textContent = "(unknown)";
    copyIpButton.disabled = true;
  }
}

fetchAndShowIp();
