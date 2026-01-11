// ---------- chart.js ----------
let chartInstance = null;

function showChart() {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  const labels = [];
  const dataPoints = [];

  // Loop all saved semesters in order
  for (let dept in saved) {
    for (let sem = 1; sem <= 8; sem++) {
      if (saved[dept][sem]) {
        labels.push(`${dept}-S${sem}`);
        dataPoints.push(saved[dept][sem]);
      }
    }
  }

  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) chartInstance.destroy(); // reset previous chart

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Semester GPA",
        data: dataPoints,
        borderColor: "#6f42c1",
        backgroundColor: "rgba(111,66,193,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#6f42c1"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}