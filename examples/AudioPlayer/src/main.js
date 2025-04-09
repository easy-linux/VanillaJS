import "./style.css";

const fileInput = document.getElementById("fileInput");
const audioEl = document.getElementById("audio");
const peaksList = document.getElementById("peaksList");
const zoomSlider = document.getElementById("zoomSlider");

const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");

const scrollContainer = document.getElementById("scrollContainer");
const autoplayToggle = document.getElementById("autoplayToggle");

const spectrogrammCanvas = document.getElementById("spectrogramm");
const spectrogrammCtx = spectrogrammCanvas.getContext("2d");
const spectrogrammSlider = document.getElementById("spectrogrammSlider");

let audioCtx, audioBuffer, duration, analyzer, dataArray, fftSize, topPeaks, waveFormPoints, zoom, animationId;

const drawSpectrogramm = () => {
  if (!analyzer) return;
  analyzer.getByteFrequencyData(dataArray);

  spectrogrammCtx.fillStyle = "#000"; // bg color
  spectrogrammCtx.fillRect(0, 0, spectrogrammCanvas.width, spectrogrammCanvas.height);
  const bufferLength = analyzer.frequencyBinCount;
  const barWidth = spectrogrammCanvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = Math.round((dataArray[i] / 255) * spectrogrammCanvas.height);
    const hue = i * 4;

    spectrogrammCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    spectrogrammCtx.fillRect(x, spectrogrammCanvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
};

const draw = () => {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();

  ctx.moveTo(0, height / 2);

  for (let i = 0; i < waveFormPoints.length; i++) {
    ctx.lineTo(i * zoom, height / 2 - waveFormPoints[i]);
  }
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;
  ctx.stroke();

  const currentTime = audioEl.currentTime;
  const progressX = (currentTime / duration) * (waveFormPoints.length * zoom);
  ctx.beginPath();
  ctx.moveTo(progressX, 0);
  ctx.lineTo(progressX, height);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.stroke();

  // auto scroll

  const scrollPadding = 100;
  scrollContainer.scrollLeft = Math.max(0, progressX - scrollContainer.clientWidth / 2 + scrollPadding);

  drawSpectrogramm();
  animationId = requestAnimationFrame(draw);
};

const resizeCanvas = () => {
  if (!audioBuffer) return;
  const samples = audioBuffer.getChannelData(0);
  const width = Math.floor(samples.length / 100) * zoom;
  canvas.width = width;
};

const calcWaveForm = () => {
  waveFormPoints = [];
  const samples = audioBuffer.getChannelData(0);
  const step = 100;
  for (let i = 0; i < samples.length; i += step) {
    let sum = 0;
    for (let j = 0; j < step; j++) {
      sum += samples[i + j] * samples[i + j] || 0;
    }
    const rms = Math.sqrt(sum / step);
    waveFormPoints.push(rms * canvas.height);
  }

  resizeCanvas();
};

fileInput.addEventListener("change", async (e) => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    // Этой строки нет в видео, но важная штука чтобы избежать утечек памяти ;)
    URL.revokeObjectURL(audioEl.src);
  }

  zoom = parseInt(zoomSlider.value, 10);

  const file = e.target.files[0];
  if (!file) return;

  audioEl.src = URL.createObjectURL(file);

  const arrayBuffer = await file.arrayBuffer();

  audioCtx = new window.AudioContext();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  duration = audioBuffer.duration;

  const track = audioCtx.createMediaElementSource(audioEl);
  analyzer = audioCtx.createAnalyser();
  const value = parseInt(spectrogrammSlider.value, 10);

  fftSize = Math.pow(2, value);
  analyzer.fftSize = fftSize;
  dataArray = new Uint8Array(analyzer.frequencyBinCount);

  track.connect(analyzer);
  analyzer.connect(audioCtx.destination);

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  const windowSize = Math.floor(sampleRate * 0.1); // 100ms

  const rmsValues = [];

  for (let i = 0; i < channelData.length; i += windowSize) {
    const window = channelData.slice(i, i + windowSize);
    const rms = Math.sqrt(window.reduce((sum, s) => sum + s * s, 0) / window.length);
    const timeMs = (i / sampleRate) * 1000;
    rmsValues.push({ rms, timeMs });
  }

  // sort and het top 10%

  const sorted = [...rmsValues].sort((a, b) => b.rms - a.rms);
  topPeaks = sorted.slice(0, Math.floor(rmsValues.length * 0.1));
  topPeaks.sort((a, b) => a.timeMs - b.timeMs);

  //generate list of peaks

  peaksList.innerHTML = "";

  topPeaks.forEach((peak, i) => {
    const btn = document.createElement("button");
    btn.textContent = `⏱️ ${peak.timeMs.toFixed(0)}ms`;
    btn.addEventListener("click", (e) => {
      audioEl.currentTime = peak.timeMs / 1000;
      if (autoplayToggle.checked) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    });
    peaksList.appendChild(btn);
  });

  calcWaveForm();
  draw();
});

zoomSlider.addEventListener("input", (e) => {
  zoom = parseInt(zoomSlider.value, 10);
  resizeCanvas();
});

spectrogrammSlider.addEventListener("input", (e) => {
  const value = parseInt(spectrogrammSlider.value, 10);

  fftSize = Math.pow(2, value);
  analyzer.fftSize = fftSize;
  dataArray = new Uint8Array(analyzer.frequencyBinCount);
});
