const DEPARTMENTS = ['ISE','CSE','ECE','EEE','AA'];
let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const deptList = document.getElementById("deptList");
const semList = document.getElementById("semList");
const subjectsEl = document.getElementById("subjects");
const feedback = document.getElementById("feedback");
const totalCreditsEl = document.getElementById("totalCredits");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const savedList = document.getElementById("savedList");

function showTab(id){
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick = () => showTab("dept");

/* Departments */
DEPARTMENTS.forEach(d=>{
  const btn=document.createElement("div");
  btn.className="dept-btn";
  btn.textContent=d;
  btn.onclick=()=>{
    state.dept=d;
    buildSem();
    showTab("sem");
  };
  deptList.appendChild(btn);
});

/* Semesters */
function buildSem(){
  semList.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("div");
    b.className="sem-btn";
    b.textContent="Semester "+i;
    b.onclick=()=>{
      state.sem=i;
      loadSyllabus();
    };
    semList.appendChild(b);
  }
}

/* Load subjects */
async function loadSyllabus(){
  feedback.textContent="Loading syllabus...";
  const file=`data/${state.dept.toLowerCase()}_sem${state.sem}.json`;

  try{
    const res=await fetch(file);
    if(!res.ok) throw "missing";
    const json=await res.json();
    state.subjects=json.subjects;
    renderSubjects();
    showTab("calc");
  }catch{
    feedback.textContent="❌ Syllabus not found";
  }
}

function renderSubjects(){
  subjectsEl.innerHTML="";
  state.subjects.forEach(s=>{
    const box=document.createElement("div");
    box.className="subject";
    box.innerHTML=`
      <b>${s.code}</b> - ${s.name} (${s.credits})
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F']
          .map(g=>`<div class="grade-cell" data-g="${g}">${g}</div>`).join("")}
      </div>`;
    subjectsEl.appendChild(box);

    box.querySelectorAll(".grade-cell").forEach(c=>{
      c.onclick=()=>{
        box.querySelectorAll(".grade-cell").forEach(x=>x.classList.remove("active"));
        c.classList.add("active");
        s.selected=c.dataset.g;
      };
    });
  });
}

function gradeToPoint(g){
  return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g];
}

/* Calculate GPA */
document.getElementById("calculate").onclick=()=>{
  let tot=0, wt=0;
  for(const s of state.subjects){
    if(!s.selected){feedback.textContent="Select all grades"; return;}
    tot+=s.credits;
    wt+=gradeToPoint(s.selected)*s.credits;
  }
  const gpa=(wt/tot).toFixed(2);
  gpaEl.textContent=gpa;
  totalCreditsEl.textContent=tot;

  document.getElementById("result-gpa").textContent="GPA: "+gpa;
  document.getElementById("result-msg").textContent=
    gpa>=9?"🌟 Outstanding":
    gpa>=8?"💪 Excellent":
    gpa>=7?"👍 Good":
    "📘 Keep improving";

  showTab("result");
};

/* Save Semester */
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
  for(const k in state.saved){
    savedList.innerHTML+=`<li>${k}: ${state.saved[k]}</li>`;
    sum+=state.saved[k];
    count++;
  }
  cgpaEl.textContent=(sum/count||0).toFixed(2);
}

let gpaChartInstance = null;

function openGraph() {
  showTab("graph");

  const labels = Object.keys(state.saved);
  const data = Object.values(state.saved);

  if (labels.length === 0) return;

  const ctx = document.getElementById("gpaChart").getContext("2d");

  if (gpaChartInstance) {
    gpaChartInstance.destroy();
  }

  gpaChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA Comparison",
        data,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: "#4338ca"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10
        }
      }
    }
  });
}