# Local-SpeedTest

> “Ever wonder if your WiFi is the problem when your phone feels slow? This tool shows whether it’s your WiFi or your internet. Just run it on your computer, open a webpage on your phone, and see the truth in 30 seconds.”

## Traditional Speed Tests

Traditional speed tests (like fast.com) measure:

- Internet speed between **your device → your ISP → the web**

They **don’t** tell you:

- If your WiFi router is the bottleneck
- If your phone’s WiFi is weak
- If interference or poor signal is to blame

**This tool fills that gap:**

- Tests **local** WiFi speed between your **computer and phone**
- Helps you see if your **router or device** is the real culprit
- Tells you when to upgrade hardware vs. call your ISP

## Real-World Stories

### Example 1 — “The Internet Isn’t the Problem”

> You pay for 500 Mbps internet.  
> fast.com says **50 Mbps** on your phone — you’re upset.  
> Run **this tool** → **400 Mbps** local WiFi speed.  
> Conclusion: Your WiFi is excellent — the ISP or internet plan is the issue.  
> Saved you from wasting $200 on a new router.

### Example 2 — “WiFi Really Is the Bottleneck”

> fast.com: **100 Mbps**  
> This tool: **30 Mbps** local WiFi  
> Your router or signal is the problem — your internet is faster than your WiFi!  
> Time to upgrade that old router or move it closer.

## Quick Start

- Clone repo
- Install dependencies: `npm install express`
- Run server: `node server.js`
- Find your computer's IP address

  **Windows:**  
  Open cmd → run `ipconfig` → find "IPv4 Address" (e.g. `192.168.1.5`)

  **Mac:**  
  System Preferences → Network → select your connection → note the IP

  **Linux:**  
  Run `ip addr` and look for your local IP (e.g. `192.168.1.5`)

### Open Your Phone

1. **Connect to the SAME WiFi** as your computer.
2. **Open your browser** (Chrome, Safari, Firefox — any).
3. **In the address bar, type:**

   ```
   http://Your-IP-Address:1976
   ```

4. **Press “Start Test”** and wait about 30 seconds.
5. **See your results instantly!**

## What the Results Mean

### Ping (Latency)

| Result       | Meaning                      |
| ------------ | ---------------------------- |
| **< 5 ms**   | Excellent WiFi connection    |
| **5–20 ms**  | Good                         |
| **20–50 ms** | Okay, possible interference  |
| **> 50 ms**  | Poor — check signal strength |

### Download Speed

How fast your phone receives data from your computer (over WiFi).  
**This measures LOCAL WiFi speed, not your internet speed.**

### Upload Speed

How fast your phone sends data to your computer.  
Usually similar to download on WiFi.

## Common Scenarios

### Scenario 1: Testing WiFi Quality

| Test      | Result   | Meaning                    |
| --------- | -------- | -------------------------- |
| This tool | 300 Mbps | Local WiFi is fast         |
| fast.com  | 50 Mbps  | Internet plan is the limit |

Your WiFi is great — your internet plan or ISP is the bottleneck.

### Scenario 2: Finding WiFi Problems

| Location    | Result   |
| ----------- | -------- |
| Living Room | 400 Mbps |
| Bedroom     | 40 Mbps  |

Weak signal or interference in the bedroom.  
Try repositioning your router or using a mesh extender.

### Scenario 3: Comparing Devices

| Device     | Result   |
| ---------- | -------- |
| Old Phone  | 80 Mbps  |
| New Laptop | 600 Mbps |

Older device → slower WiFi chip, not a network issue.

## Tech Stack

- **Node.js + Express** – Local web server
- **HTML, CSS, JS** – Frontend interface
- **Local Network** – Direct WiFi communication between phone & computer

## Privacy & Security

This tool runs **entirely on your local network.**  
No data leaves your home, no tracking, and no cloud servers involved.  
It’s 100% private.
