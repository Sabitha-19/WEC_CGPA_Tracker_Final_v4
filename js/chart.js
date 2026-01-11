function showGraph(){
  goTo("page-graph");
  const saved=JSON.parse(localStorage.getItem("wec"))||[];
  const labels=saved.map(s=>"Sem "+s.semester);
  const data=saved.map(s=>s.gpa);

  const ctx=document.getElementById("cgpaChart");
  if(window.cgpaChart) window.cgpaChart.destroy();

  window.cgpaChart=new Chart(ctx,{
    type:"line",
    data:{
      labels,
      datasets:[{
        label:"GPA",
        data,
        tension:0.3,
        fill:true
      }]
    }
  });
}