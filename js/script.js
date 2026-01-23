let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;

let subjects = [];
let grades = {};

const departments = {
  engineering: ["cse", "ise", "ece", "eee", "aa"],
  bcom: ["bcom"]
};

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

/* PAGE NAV */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* STREAM */
function selectStream(stream,btn){
  selectedStream = stream;
  document.querySelectorAll("#stream-page .cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

/* DEPARTMENT */
function showDepartments(){
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";
  departments[selectedStream].forEach(dep=>{
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = dep.toUpperCase();
    b.onclick = ()=>selectDepartment(dep,b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep,btn){
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid .cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

/* SEMESTER */
function showSemesters(){
  const grid = document.getElementById("semester-grid");
  grid.innerHTML = "";
  for(let i=1;i<=8;i++){
    const b = document.createElement("button");
    b.className="cube-btn";
    b.textContent="Semester "+i;
    b.onclick=()=>selectSemester(i,b);
    grid.appendChild(b);
  }
}

function selectSemester(sem,btn){
  selectedSemester = sem;
  document.querySelectorAll("#semester-grid .cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

/* LOAD SUBJECTS */
function loadSubjects(){
  grades = {};
  fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`)
    .then(r=>r.json())
    .then(data=>{
      subjects = data;
      renderSubjects();
      showPage("subjects-page");
    })
    .catch(()=>alert("Subject file not found"));
}

/* RENDER SUBJECTS */
function renderSubjects(){
  const box = document.getElementById("subjects-list");
  box.innerHTML = "";
  subjects.forEach(sub=>{
    const div = document.createElement("div");
    div.className="subject";
    div.innerHTML = `
      <strong>${sub.name}</strong>
      <select onchange="grades['${sub.code}']=this.value">
        <option value="">Grade</option>
        <option>S</option><option>A</option><option>B</option>
        <option>C</option><option>D</option><option>E</option><option>F</option>
      </select>`;
    box.appendChild(div);
  });
}

/* GPA */
function calculateGPA(){
  let total=0, credits=0;
  subjects.forEach(s=>{
    const g=grades[s.code];
    if(g){
      total+=gradePoints[g]*s.credits;
      credits+=s.credits;
    }
  });
  const gpa = credits ? (total/credits).toFixed(2) : "0.00";
  document.getElementById("cgpa-display").innerText = `CGPA: ${gpa}`;
  showPage("result-page");
}

/* FAQ */
function toggleFAQ(){
  document.getElementById("faq-section").classList.toggle("hidden");
}