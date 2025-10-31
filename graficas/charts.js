
let chart;

async function loadCSV(path) {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return parsed.data;
}

function getColumns(data) {
  return Object.keys(data[0]);
}

function detectType(values) {
  const sample = values.slice(0, 20).filter(v => v !== "" && v !== null);
  const numeric = sample.every(v => !isNaN(parseFloat(v)));
  return numeric ? "numérica" : "categórica";
}

function summarize(data) {
  const cols = Object.keys(data[0]);
  const summary = cols.map(col => {
    const vals = data.map(r => r[col]);
    const tipo = detectType(vals);
    return `${col}: ${tipo} (muestra ${vals.slice(0, 50).length})`;
  }).join("\n");
  document.getElementById("summary").textContent = `Filas: ${data.length}\nColumnas: ${cols.length}\n${summary}`;
}

function countCategories(values) {
  const counts = {};
  values.forEach(v => {
    if (v === "" || v == null) return;
    counts[v] = (counts[v] || 0) + 1;
  });
  return counts;
}

function makeChart(labels, values, type, title) {
  const ctx = document.getElementById("mainChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: 'rgba(54,162,235,0.5)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

document.getElementById("renderBtn").addEventListener("click", async () => {
  const csvPath = document.getElementById("csvSelect").value;
  const xCol = document.getElementById("xColumn").value;
  const yCol = document.getElementById("yColumn").value;
  const chartTypeSel = document.getElementById("chartType").value;

  const data = await loadCSV(csvPath);
  summarize(data);

  const xValues = data.map(r => r[xCol]);
  const xType = detectType(xValues);
  const yType = yCol ? detectType(data.map(r => r[yCol])) : null;

  let labels = [], values = [], chartType = "bar", title = "";

  if (chartTypeSel === "hist" || (xType === "numérica" && !yCol)) {
    const nums = xValues.filter(v => typeof v === "number" && !isNaN(v));
    const binsInput = document.getElementById("binsInput");
    const bins = binsInput ? parseInt(binsInput.value) : 10;
    const min = Math.min(...nums), max = Math.max(...nums);
    const step = (max - min) / bins;
    const hist = new Array(bins).fill(0);
    nums.forEach(v => {
      const idx = Math.min(Math.floor((v - min) / step), bins - 1);
      hist[idx]++;
    });
    labels = Array.from({ length: bins }, (_, i) => (min + i * step).toFixed(1));
    values = hist;
    chartType = "bar";
    title = `Histograma de "${xCol}" (${csvPath.split("/").pop()})`;
  }
  else if (!yCol && xType === "categórica") {
    const counts = countCategories(xValues);
    labels = Object.keys(counts);
    values = Object.values(counts);
    chartType = "bar";
    title = `Barras: Frecuencia por "${xCol}" (${csvPath.split("/").pop()})`;
  }
  else if (yCol && xType === "numérica" && yType === "numérica") {
    const points = data.filter(r => !isNaN(r[xCol]) && !isNaN(r[yCol]));
    labels = points.map(r => r[xCol]);
    values = points.map(r => ({ x: r[xCol], y: r[yCol] }));
    chartType = "scatter";
    title = `Dispersión: ${xCol} vs ${yCol} (${csvPath.split("/").pop()})`;
  }

  makeChart(labels, values, chartType, title);
});

// Inicialización con manejo de errores
(async () => {
  try {
    console.log('🚀 Inicializando gráficas...');
    const csvPath = document.getElementById("csvSelect").value;
    console.log('📂 Cargando CSV:', csvPath);
    
    const data = await loadCSV(csvPath);
    console.log('✅ Datos cargados:', data.length, 'registros');
    
    const cols = getColumns(data);
    console.log('📊 Columnas encontradas:', cols);
    
    const xSel = document.getElementById("xColumn");
    const ySel = document.getElementById("yColumn");
    
    xSel.innerHTML = cols.map(c => `<option>${c}</option>`).join("");
    ySel.innerHTML = `<option value="">(ninguna)</option>` + cols.map(c => `<option>${c}</option>`).join("");
    
    // Auto-generar primera gráfica
    summarize(data);
    console.log('✅ Inicialización completada');
    
    // Hacer primera gráfica automáticamente
    if (cols.length > 0) {
      const firstCol = cols[0];
      const values = data.map(r => r[firstCol]);
      const type = detectType(values);
      
      if (type === 'categórica') {
        const counts = countCategories(values);
        makeChart(Object.keys(counts), Object.values(counts), 'bar', `Frecuencia: ${firstCol}`);
      } else {
        const nums = values.filter(v => typeof v === "number" && !isNaN(v));
        if (nums.length > 0) {
          const bins = 10;
          const min = Math.min(...nums), max = Math.max(...nums);
          const step = (max - min) / bins;
          const hist = new Array(bins).fill(0);
          nums.forEach(v => {
            const idx = Math.min(Math.floor((v - min) / step), bins - 1);
            hist[idx]++;
          });
          const labels = Array.from({ length: bins }, (_, i) => (min + i * step).toFixed(1));
          makeChart(labels, hist, 'bar', `Histograma: ${firstCol}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    document.getElementById("summary").textContent = `Error: ${error.message}`;
  }
})();
