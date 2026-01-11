const gradePoint = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

let state = {
  stream: "",
  dept: "",
  sem: "",
  history: []
};

function go(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function selectStream(s){
  state.stream = s;
  const depts = s === "engineering" ? ["cse","ise","ece","eee","aa"] : ["bcom"];
  const box = document.getElementById("deptBox");
  box.innerHTML = "";
  depts.forEach(d=>{
    const b=document.createElement("button");
    b.textContent=d.toUpperCase();
    b.onclick=()=>{state.dept=d;loadSem();};
    box.appendChild(b);
  });
  go("dept");
}

function loadSem(){
  const max = state.stream==="engineering"?8:6;
  const box=document.getElementById("semBox");
  box.innerHTML="";
  for(let i=1;i<=max;i++){
    const b=document.createElement("button");
    b.textContent="Semester "+i;
    b.onclick=()=>{state.sem=i;loadSubjects();};
    box.appendChild(b);
  }
  go("sem");
}

async function loadSubjects(){
  const file=`data/${state.dept}_sem${state.sem}.json`;
  const res=await fetch(file);
  const data=await res.json();
  const box=document.getElementById("subjects");
  box.innerHTML="";
  data.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`
      <span>${s.name} (${s.credits})</span>
      <select data-credit="${s.credits}">
        ${Object.keys(gradePoint).map(g=>`<option>${g}</option>`).join("")}
      </select>`;
    box.appendChild(div);
  });
  go("subjectsSec");
}

function calculate(){
  let total=0, credits=0;
  document.querySelectorAll("select").forEach(sel=>{
    const c=Number(sel.dataset.credit);
    credits+=c;
    total+=c*gradePoint[sel.value];
  });
  const gpa=(total/credits).toFixed(2);
  document.getElementById("gpa").textContent=gpa;
  document.getElementById("percent").textContent=`≈ ${(gpa*10).toFixed(1)}%`;
  go("result");
}

function save(){
  state.history.push(Number(document.getElementById("gpa").textContent));
  alert("Semester saved!");
}

let chart;
function draw(){
  go("graph");
  const ctx=document.getElementById("chart");
  if(chart)chart.destroy();
  chart=new Chart(ctx,{
    type:"line",
    data:{
      labels:state.history.map((_,i)=>`Sem ${i+1}`),
      datasets:[{data:state.history,borderColor:"#5a4fcf",tension:.3}]
    }
  });
}