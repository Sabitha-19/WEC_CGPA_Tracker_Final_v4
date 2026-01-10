const ENGINEERING_DEPTS = ["ise", "cse", "ece", "eee", "aa"];
const OTHER_DEPTS = ["bcom"];

const GRADE_POINTS = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

let state = {
  stream: null,
  dept: null,
  sem: null,
  semesters: {}
};

/* -------- LOAD FROM LOCAL STORAGE -------- */
if(localStorage.getItem("cgpaState")) {
  state = JSON.parse(localStorage.getItem("cgpaState"));
  document.addEventListener("DOMContentLoaded", () => {
    if(state.stream) selectStream(state.stream);
    if(state.dept) selectDept(state.dept, document.querySelectorAll("#departmentBox .grid-item")[ENGINEERING_DEPTS.indexOf(state.dept)]);
    if(state.sem) selectSemester(state.sem, document.querySelectorAll("#semesterBox .grid-item")[state.sem-1]);
    calculateCGPA();
  });
}

/* -------- STREAM -------- */
function selectStream(stream){
  state.stream = stream;
  state.dept = null; state.sem = null;
  document.getElementById("departmentBox").innerHTML = "";
  document.getElementById("semesterBox").innerHTML = "";
  document.getElementById("subjectsBox").innerHTML = "";
  renderDepartments();
}

/* -------- DEPARTMENTS -------- */
function renderDepartments() {
  const box = document.getElementById("departmentBox");
  box.innerHTML = "";
  const list = state.stream === "engineering" ? ENGINEERING_DEPTS : OTHER_DEPTS;

  list.forEach((d,i) => {
    const btn = document.createElement("button");
    btn.className = "grid-item";
    btn.textContent = d.toUpperCase();
    btn.onclick = () => selectDept(d, btn);
    box.appendChild(btn);
  });
}

function selectDept(dept, btn){
  state.dept = dept;
  document.querySelectorAll("#departmentBox .grid-item").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderSemesters();
}

/* -------- SEMESTERS -------- */
function renderSemesters(){
  const box = document.getElementById("semesterBox");
  box.innerHTML = "";
  const total = state.stream==="engineering"?8:6;

  for(let i=1;i<=total;i++){
    const btn = document.createElement("button");
    btn.className = "grid-item";
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => selectSemester(i,btn);
    box.appendChild(btn);
  }
}

function selectSemester(sem,btn){
  state.sem = sem;
  document.querySelectorAll("#semesterBox .grid-item").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderSubjects();
}

/* -------- SUBJECTS -------- */
function renderSubjects(){
  const box = document.getElementById("subjectsBox");
  box.innerHTML = "";
  for(let i=1;i<=5;i++){
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `<strong>Subject ${i}</strong>`;
    const row = document.createElement("div");
    row.className = "grade-row";

    Object.keys(GRADE_POINTS).forEach(g=>{
      const gb = document.createElement("div");
      gb.className = "g-box";
      gb.textContent = g;
      gb.onclick = () => {
        row.querySelectorAll(".g-box").forEach(x=>x.classList.remove("active"));
        gb.classList.add("active");
      };
      row.appendChild(gb);
    });

    div.appendChild(row);
    box.appendChild(div);
  }
}

/* -------- SAVE & CGPA -------- */
function saveSemester(){
  const grades=[];
  document.querySelectorAll(".grade-row").forEach(row=>{
    const g=row.querySelector(".g-box.active");
    if(g) grades.push(GRADE_POINTS[g.textContent]);
  });

  if(grades.length===0) return;
  const avg = grades.reduce((a,b)=>a+b)/grades.length;
  state.semesters[state.sem] = avg;
  localStorage.setItem("cgpaState", JSON.stringify(state));
  calculateCGPA();
}

/* -------- CGPA & CHART -------- */
let chart=null;
function calculateCGPA(){
  const values=Object.values(state.semesters);
  if(values.length===0) return;
  const cgpa=values.reduce((a,b)=>a+b)/values.length;
  document.getElementById("cgpa").textContent=cgpa.toFixed(2);
  renderChart();
}

function renderChart(){
  const ctx=document.getElementById("cgpaChart").getContext("2d");
  const labels = Object.keys(state.semesters).map(s=>`Sem ${s}`);
  const data = Object.values(state.semesters);
  if(chart) chart.destroy();
  chart = new Chart(ctx,{
    type:"line",
    data:{
      labels:labels,
      datasets:[{
        label:"CGPA",
        data:data,
        borderColor:"#4f46e5",
        backgroundColor:"rgba(79,70,229,0.2)",
        fill:true,
        tension:0.3
      }]
    },
    options:{
      scales:{
        y:{min:0,max:10}
      }
    }
  });
}

/* -------- RESET -------- */
function resetAll(){
  state={stream:null,dept:null,sem:null,semesters:{}};
  localStorage.removeItem("cgpaState");
  document.getElementById("departmentBox").innerHTML="";
  document.getElementById("semesterBox").innerHTML="";
  document.getElementById("subjectsBox").innerHTML="";
  document.getElementById("cgpa").textContent="0.00";
  if(chart) chart.destroy();
}