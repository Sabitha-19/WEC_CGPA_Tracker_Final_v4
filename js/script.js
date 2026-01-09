const DEPARTMENTS = ['ISE','CSE','ECE','EEE'];
let state = { dept:null, sem:null, subjects:[], saved:{} };
let chartInstance = null;

const deptList = document.getElementById('deptList');
const semList = document.getElementById('semList');
const subjectsEl = document.getElementById('subjects');
const totalCreditsEl = document.getElementById('totalCredits');
const gpaEl = document.getElementById('gpa');
const feedback = document.getElementById('feedback');
const savedList = document.getElementById('savedList');
const cgpaEl = document.getElementById('cgpa');

function showTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById("startBtn").onclick = () => showTab("dept");

/* Departments */
DEPARTMENTS.forEach(d=>{
  const b=document.createElement("div");
  b.className="dept-btn";
  b.textContent=d;
  b.onclick=()=>{ state.dept=d; buildSem(); showTab("sem"); };
  deptList.appendChild(b);
});

function buildSem(){
  semList.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("div");
    b.className="sem-btn";
    b.textContent="Semester "+i;
    b.onclick=()=>{ state.sem=i; loadDummySubjects(); showTab("calc"); };
    semList.appendChild(b);
  }
}

/* Dummy Subjects */
function loadDummySubjects(){
  state.subjects=[
    {code:"SUB1",credits:4},{code:"SUB2",credits:3},{code:"SUB3",credits:3}
  ];
  renderSubjects();
}

function renderSubjects(){
  subjectsEl.innerHTML="";
  state.subjects.forEach(s=>{
    const box=document.createElement("div");
    box.innerHTML=`<b>${s.code}</b>
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F'].map(g=>`<span class="grade" data-g="${g}">${g}</span>`).join("")}
      </div>`;
    subjectsEl.appendChild(box);

    box.querySelectorAll(".grade").forEach(g=>{
      g.onclick=()=>{
        box.querySelectorAll(".grade").forEach(x=>x.classList.remove("active"));
        g.classList.add("active");
        s.selected=g.dataset.g;
      }
    });
  });
}

function gradeToPoint(g){ return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g]||0 }

/* Calculate GPA */
document.getElementById("calculate").onclick=()=>{
  let tot=0,wt=0;
  for(const s of state.subjects){
    if(!s.selected){ feedback.textContent="Select all grades"; return;}
    tot+=s.credits;
    wt+=gradeToPoint(s.selected)*s.credits;
  }
  const gpa=(wt/tot).toFixed(2);
  totalCreditsEl.textContent=tot;
  gpaEl.textContent=gpa;
  feedback.textContent="GPA Calculated ✔";
}

/* Save via ICON */
function saveSemester(){
  if(!state.dept||!state.sem) return;
  const gpa=parseFloat(gpaEl.textContent);
  if(!gpa) return;

  state.saved[`${state.dept}_Sem${state.sem}`]=gpa;
  localStorage.setItem("wec_saved",JSON.stringify(state.saved));
  renderSaved();
  showTab("saved");
}

function renderSaved(){
  savedList.innerHTML="";
  let sum=0,count=0;
  for(const [k,v] of Object.entries(state.saved)){
    savedList.innerHTML+=`<li>${k}: ${v}</li>`;
    sum+=v; count++;
  }
  cgpaEl.textContent=(sum/count).toFixed(2);
}

/* GRAPH ICON */
function openGraph(){
  showTab("graph");
  setTimeout(drawGraph,100);
}

function drawGraph(){
  const labels=Object.keys(state.saved);
  const data=Object.values(state.saved);
  if(chartInstance) chartInstance.destroy();

  chartInstance=new Chart(
    document.getElementById("gpaChart"),{
    type:"line",
    data:{
      labels,
      datasets:[{
        label:"Semester GPA",
        data,
        borderColor:"#6366f1",
        pointBackgroundColor:["#ef4444","#22c55e","#3b82f6","#f59e0b"],
        tension:0.4
      }]
    }
  });
}