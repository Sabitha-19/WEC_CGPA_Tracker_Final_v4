let cgpaChart;

function drawChart(semesters) {
  const labels = Object.keys(semesters);
  const values = Object.values(semesters);

  const ctx = document.getElementById("chart");

  if (cgpaChart) cgpaChart.destroy();

  cgpaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA",
        data: values,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 10 }
      }
    }
  });
}