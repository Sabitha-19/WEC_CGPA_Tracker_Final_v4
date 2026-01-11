const ctx=document.getElementById("cgpaChart");
const chart=new Chart(ctx,{
  type:"line",
  data:{labels:[],datasets:[{label:"GPA",data:[],borderWidth:2}]}
});

function updateChart(){
  let data=JSON.parse(localStorage.getItem("wecData"))||[];
  chart.data.labels=data.map(d=>"Sem "+d.sem);
  chart.data.datasets[0].data=data.map(d=>d.gpa);
  chart.update();
}