let RAW_ROWS = [];
let HEADERS = [];
let CHART = null;

const csvSelect = document.getElementById("csvSelect");
const xColumn = document.getElementById("xColumn");
const yColumn = document.getElementById("yColumn");
const chartType = document.getElementById("chartType");
const binsInput = document.getElementById("binsInput");
const summaryEl = document.getElementById("summary");
const chartTitle = document.getElementById("chartTitle");

document.getElementById("renderBtn").addEventListener("click", () => renderChart());

init();

async function init() {
  await loadCSV(csvSelect.value);
  csvSelect.addEventListener("change", async () => {
    await loadCSV(csvSelect.value);
  });
}

async function loadCSV(path) {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, dynamicTyping: false, skipEmptyLines: true });

  RAW_ROWS = parsed.data;
  HEADERS = parsed.meta.fields || [];

  // Popular selects
  xColumn.innerHTML = "";
  yColumn.innerHTML = "";
  HEADERS.forEach(h => {
    const o1 = document.createElement("option");
    o1.value = h; o1.textContent = h; xColumn.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = h; o2.textContent = h; yColumn.appendChild(o2);
  });

  yColumn.insertAdjacentHTML("afterbegin", `<option value="">(ninguna)</option>`);
  yColumn.value = "";

  summaryEl.textContent = buildSummary(RAW_ROWS, HEADERS);

  chartType.value = "auto";
  renderChart();
}

function buildSummary(rows, headers) {
  const n = rows.length;
  const lines = [`Filas: ${n}`, `Columnas: ${headers.length}`, ``];
  headers.forEach(h => {
    const sample = rows.slice(0, 50).map(r => r[h]).filter(v => v !== undefined && v !== null && `${v}`.trim() !== "");
    const type = guessType(sample);
    lines.push(`${h}: ${type} (muestra 50)`);
  });
  return lines.join("\n");
}

function guessType(arr) {
  const nums = arr.map(v => toNumber(v)).filter(v => !Number.isNaN(v));
  const ratio = nums.length / Math.max(1, arr.length);
  return ratio > 0.8 ? "numérica" : "categórica";
}

function toNumber(v) {
  if (v == null) return NaN;
  const s = String(v).trim().replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function renderChart() {
  if (!RAW_ROWS.length) return;

  const x = xColumn.value;
  const y = yColumn.value || null;
  const mode = chartType.value;
  const bins = Number(binsInput.value) || 20;

  const xSample = RAW_ROWS.map(r => r[x]).filter(v => v !== undefined && v !== null && `${v}`.trim() !== "");
  const xType = guessType(xSample);

  let finalType = mode;
  if (mode === "auto") {
    if (y) {
      const ySample = RAW_ROWS.map(r => r[y]).filter(v => v !== undefined && v !== null && `${v}`.trim() !== "");
      const yType = guessType(ySample);
      finalType = (xType === "numérica" && yType === "numérica") ? "scatter" : "bar";
    } else {
      finalType = (xType === "numérica") ? "hist" : "bar";
    }
  }

  const ctx = document.getElementById("mainChart").getContext("2d");
  if (CHART) CHART.destroy();

  if (finalType === "bar") {
    const counts = groupCounts(RAW_ROWS, x);
    chartTitle.textContent = `Barras: Frecuencia por "${x}" (${csvSelect.selectedOptions[0].textContent})`;
    CHART = new Chart(ctx, {
      type: "bar",
      data: {
        labels: counts.labels,
        datasets: [{ label: "Frecuencia", data: counts.values }]
      },
      options: {
        parsing: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { autoSkip: true, maxRotation: 45 } } }
      }
    });
  }

  if (finalType === "hist") {
    const values = xSample.map(toNumber).filter(v => !Number.isNaN(v));
    const { edges, counts } = histogram(values, bins);
    const labels = edges.slice(0, -1).map((e, i) => `${round(edges[i])}–${round(edges[i+1])}`);
    chartTitle.textContent = `Histograma de "${x}" (${bins} bins) (${csvSelect.selectedOptions[0].textContent})`;
    CHART = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Frecuencia", data: counts }]
      },
      options: {
        parsing: false,
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { autoSkip: true, maxRotation: 45 } } }
      }
    });
  }

  if (finalType === "scatter") {
    const points = RAW_ROWS
      .map(r => ({ x: toNumber(r[x]), y: toNumber(r[y]) }))
      .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));

    chartTitle.textContent = `Dispersión "${x}" vs "${y}" (${csvSelect.selectedOptions[0].textContent})`;
    CHART = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: `${x} vs ${y}`,
          data: points,
          pointRadius: 3
        }]
      },
      options: {
        parsing: false,
        scales: {
          x: { title: { display: true, text: x } },
          y: { title: { display: true, text: y } }
        }
      }
    });
  }
}

function groupCounts(rows, col) {
  const map = new Map();
  rows.forEach(r => {
    const key = String(r[col] ?? "").trim();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40);
  return { labels: entries.map(e => e[0]), values: entries.map(e => e[1]) };
}

function histogram(values, bins = 20) {
  if (!values.length) return { edges: [], counts: [] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / bins || 1;
  const edges = Array.from({ length: bins + 1 }, (_, i) => min + i * step);
  const counts = new Array(bins).fill(0);
  values.forEach(v => {
    let idx = Math.floor((v - min) / step);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  });
  return { edges, counts };
}

function round(x) {
  if (Math.abs(x) >= 1000) return Math.round(x);
  return Math.round(x * 100) / 100;
}
