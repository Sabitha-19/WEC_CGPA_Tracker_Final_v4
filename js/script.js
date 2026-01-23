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

let semesterChart = null;

/* GRAPH */
function openGraph(){
  showPage("graph-page");

  const data = Array(8).fill(null);
  savedSemesters.forEach(s => {
    data[s.semester - 1] = s.gpa;
  });

  const ctx = document.getElementById("semesterChart").getContext("2d");

  if (semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets: [{
        label: "Semester GPA",
        data: data,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          min: 0,
          max: 10
        }
      }
    }
  });
}

/* SAVED SEMESTERS */
function showSaved(){
  showPage("saved-page");

  const list = document.getElementById("saved-list");
  list.innerHTML = "";

  if (savedSemesters.length === 0) {
    list.innerHTML = "<p>No CGPA data saved</p>";
    return;
  }

  savedSemesters.forEach(s => {
    list.innerHTML += `
      <div class="subject">
        Semester ${s.semester} – GPA: <b>${s.gpa}</b>
      </div>
    `;
  });
}

document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;

    document.querySelectorAll(".faq-answer").forEach(a => {
      if (a !== answer) a.style.display = "none";
    });

    answer.style.display =
      answer.style.display === "block" ? "none" : "block";
  });
});