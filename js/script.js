let state={
  stream:"",
  dept:"",
  sem:0,
  saved:JSON.parse(localStorage.getItem("wec_saved"))||[]
};

const grades={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
}

function selectStream(s){
  state.stream=s;
  loadDepartments();
  showSection("department");
}

function loadDepartments(){
  const depts=["CSE","ISE","ECE","EEE","AA"];
  const box=document.getElementById("deptButtons");
  box.innerHTML="";
  depts.forEach(d=>{
    const b=document.createElement("button");
    b.innerText=d;
    b.onclick=()=>{state.dept=d;loadSem()};
    box.appendChild(b);
  });
}

function loadSem(){
  const max=state.stream==="Engineering"?8:6;
  const box=document.getElementById("semButtons");
  box.innerHTML="";
  for(let i=1;i<=max;i++){
    const b=document.createElement("button");
    b.innerText="Semester "+i;
    b.onclick=()=>{state.sem=i;loadSubjects()};
    box.appendChild(b);
  }
  showSection("semester");
}

function loadSubjects(){
  const list=document.getElementById("subjects");
  list.innerHTML="";
  for(let i=1;i<=5;i++){
    const d=document.createElement("div");
    d.className="subject";
    d.innerHTML=`Subject ${i}
      <select>
        ${Object.keys(grades).map(g=>`<option>${g}</option>`).join("")}
      </select>`;
    list.appendChild(d);
  }
  showSection("grades");
}

function calculateGPA(){
  let sum=0;
  document.querySelectorAll("select").forEach(s=>sum+=grades[s.value]);
  const gpa=(sum/5).toFixed(2);
  document.getElementById("gpa").innerText=gpa;
  showSection("result");
}

function saveSemester(){
  state.saved[state.sem-1]=parseFloat(document.getElementById("gpa").innerText);
  localStorage.setItem("wec_saved",JSON.stringify(state.saved));
  alert("Semester saved");
}

function convert(){
  const v=document.getElementById("cgpaInput").value;
  document.getElementById("percent").innerText=(v*10).toFixed(1)+"%";
}

let chart;
function showGraph(){
  showSection("graph");
  const ctx=document.getElementById("chart");
  if(chart)chart.destroy();
  chart=new Chart(ctx,{
    type:"line",
    data:{
      labels:state.saved.map((_,i)=>"Sem "+(i+1)),
      datasets:[{
        data:state.saved,
        borderColor:"#5a4fcf",
        tension:.4
      }]
    }
  });
}