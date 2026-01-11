let chart;

function drawChart(){
  let data = JSON.parse(localStorage.getItem('cgpaData')||'[]');
  if(!data.length) return;

  const ctx = document.getElementById('cgpaChart');
  if(chart) chart.destroy();

  chart = new Chart(ctx,{
    type:'line',
    data:{
      labels:data.map(d=>'Sem '+d.semester),
      datasets:[{
        label:'GPA',
        data:data.map(d=>d.gpa),
        fill:false,
        tension:.3
      }]
    }
  });
}