const ENGINEERING_DEPTS = ["ise", "cse", "ece", "eee", "aa"];
const OTHER_DEPTS = ["bcom"];

const GRADE_POINTS = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

let state = {
  stream: null,
  dept: null,
  sem: null,
  semesters: {}
};

/* STREAM */
function selectStream(stream) {
  state.stream = stream;
  state.dept = null;
  state.sem = null;
  document.getElementById("subjects").innerHTML = "";
  renderDepartments();
}

/* DEPARTMENT */
function renderDepartments() {
  const div = document.getElementById("departments");
  div.innerHTML = "";

  const depts = state.stream === "engineering" ? ENGINEERING_DEPTS : OTHER_DEPTS;

  depts.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "grid-item-btn";
    btn.textContent = d.toUpperCase();
    btn.onclick = () => selectDept(d);
    div.appendChild(btn);
  });
}

function selectDept(dept) {
  state.dept = dept;
  renderSemesters();
}

/* SEMESTER */
function renderSemesters() {
  const div = document.getElementById("semesters");
  div.innerHTML = "";

  const totalSem = 8; // AA also 8 semesters

  for (let i = 1; i <= totalSem; i++) {
    const btn = document.createElement("button");
    btn.className = "grid-item-btn";
    btn.textContent = "Semester " + i;
    btn.onclick = () => loadSubjects(i);
    div.appendChild(btn);
  }
}

/* SUBJECTS */
function loadSubjects(sem) {
  state.sem = sem;
  const subjectsDiv = document.getElementById("subjects");
  subjectsDiv.innerHTML = "";

  const subjects = [
    "Subject 1",
    "Subject 2",
    "Subject 3",
    "Subject 4",
    "Subject 5"
  ];

  subjects.forEach((sub, idx) => {
    const card = document.createElement("div");
    card.className = "subject-card";

    card.innerHTML = `
      <h4>${sub}</h4>
      <div class="grade-row">
        ${Object.keys(GRADE_POINTS).map(g =>
          `<div class="g-box" onclick="selectGrade(${idx}, '${g}', this)">${g}</div>`
        ).join("")}
      </div>
    `;
    subjectsDiv.appendChild(card);
  });

  state.currentGrades = {};
}

function selectGrade(index, grade, el) {
  el.parentElement.querySelectorAll(".g-box").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  state.currentGrades[index] = GRADE_POINTS[grade];
}

/* SAVE */
function saveSemester() {
  if (!state.currentGrades) return;

  const grades = Object.values(state.currentGrades);
  if (grades.length === 0) return alert("Select grades first!");

  const avg = grades.reduce((a,b)=>a+b,0) / grades.length;
  state.semesters[state.sem] = avg;

  calculateCGPA();
  alert("Semester Saved!");
}

/* CGPA */
function calculateCGPA() {
  const values = Object.values(state.semesters);
  const cgpa = values.reduce((a,b)=>a+b,0) / values.length;
  document.getElementById("cgpa").textContent = cgpa.toFixed(2);
}

/* RESET */
function resetAll() {
  state = { stream:null, dept:null, sem:null, semesters:{} };
  document.getElementById("departments").innerHTML = "";
  document.getElementById("semesters").innerHTML = "";
  document.getElementById("subjects").innerHTML = "";
  document.getElementById("cgpa").textContent = "0.00";
}