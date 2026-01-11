let ctx = document.getElementById('chart').getContext('2d');
let gpaChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Semester GPA',
            data: [],
            backgroundColor: 'rgba(106,27,154,0.2)',
            borderColor: 'rgba(106,27,154,1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius:5
        }]
    },
    options: {
        scales: { y: { beginAtZero:true, max:10 } }
    }
});

function updateChart(sem, gpa){
    let gpaArr = JSON.parse(localStorage.getItem('gpaArr')) || [];
    gpaArr[sem-1] = parseFloat(gpa);
    gpaChart.data.labels = gpaArr.map((_,i)=>"Sem "+(i+1));
    gpaChart.data.datasets[0].data = gpaArr;
    gpaChart.update();
    localStorage.setItem('gpaArr', JSON.stringify(gpaArr));
}