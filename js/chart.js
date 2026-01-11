function drawChart(){
    if(chart) chart.destroy();
    chart = new Chart(document.getElementById("chart"),{
        type:'line',
        data:{
            labels: state.gpaHistory.map((_,i)=>"Sem "+(i+1)),
            datasets:[{
                label:"GPA",
                data: state.gpaHistory,
                borderColor:"#7c3aed",
                backgroundColor:"rgba(124,58,237,0.2)",
                tension:0.3,
                fill:true,
                pointRadius:5
            }]
        },
        options:{
            responsive:true,
            scales:{
                y:{ min:0, max:10 },
                x:{ ticks:{ color:"#1f2937" } }
            }
        }
    });
}