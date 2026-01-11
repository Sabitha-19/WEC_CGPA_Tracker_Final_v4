let chartInstance;
function drawChart(){
  const ctx = document.getElementById("chart").getContext("2d");
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx,{
    type:"line",
    data:{
      labels: state.gpaHistory.map((_,i)=>"Sem "+(i+1)),
      datasets:[{
        label:"GPA",
        data: state.gpaHistory,
        borderColor:"#7c3aed",
        backgroundColor:"rgba(124, 58, 237,0.2)",
        fill:true,
        tension:0.3,
        pointRadius:5
      }]
    },
    options:{
      responsive:true,
      scales:{ y:{ min:0, max:10, ticks:{ stepSize:1 } } }
    }
  });
}