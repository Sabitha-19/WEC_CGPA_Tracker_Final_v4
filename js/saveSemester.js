function saveSemester(gpa){
  let data=JSON.parse(localStorage.getItem("wecData"))||[];
  data.push({sem:selectedSem,gpa:parseFloat(gpa)});
  localStorage.setItem("wecData",JSON.stringify(data));
  calculateCGPA();
  updateChart();
}

function calculateCGPA(){
  let data=JSON.parse(localStorage.getItem("wecData"))||[];
  if(!data.length) return;
  let avg=(data.reduce((a,b)=>a+b.gpa,0)/data.length).toFixed(2);
  cgpa.innerText=avg;
  percentage.innerText=((avg-0.75)*10).toFixed(2)+"%";
  msg.innerText=avg>=8?"Excellent! 🎉":avg>=6?"Good 👍":"Improve next semester 💪";
}