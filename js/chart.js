let chartInstance;

function drawChart() {
    const ctx = document.getElementById('chart').getContext('2d');

    const semesters = state.gpaHistory.map((gpa, idx) => `Sem ${idx + 1}`);
    const gpas = state.gpaHistory.map(gpa => gpa || 0);

    if(chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semesters,
            datasets: [{
                label: 'GPA',
                data: gpas,
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                tension: 0.3,
                fill: true,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 10 },
                x: { ticks: { color: "#1f2937" } }
            }
        }
    });
}