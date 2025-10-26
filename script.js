// browser JS: no require()
const startButton = document.getElementById("startButton");
const resultsLog = document.getElementById("results");

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

    // Download Test
    log("Testing Download Speed...");
    const dlStartTime = Date.now();
    const dlResponse = await fetch("/download", { cache: "no-store" });
    const reader = dlResponse.body.getReader();
    let bytesReceived = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesReceived += value.length;
    }

    const dlTimeInSeconds = (Date.now() - dlStartTime) / 1000;
    const dlSpeedMbps = (
      (bytesReceived * 8) /
      (dlTimeInSeconds * 1000 * 1000)
    ).toFixed(2);
    log(`Download Speed: ${dlSpeedMbps} Mbps`);

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
  } catch (error) {
    log(`Error occurred: ${error.message}`);
  } finally {
    log("Test completed. ");
    startButton.disabled = false;
  }
}

startButton.onclick = startTest;
