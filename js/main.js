const gradePoints = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
};

let selectedStream = "";
let selectedDept = "";
let selectedSem = "";
let subjects = [];

const sections = document.querySelectorAll("section");

function show(id) {
  sections.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("continueBtn").onclick = () => show("stream");

/* STREAM */
const streams = {
  Engineering: ["cse", "ise", "ece", "eee", "aa"],
  BCOM: ["bcom"]
};

const streamList = document.getElementById("streamList");
Object.keys(streams).forEach(s => {
  const b = document.createElement("button");
  b.textContent = s;
  b.onclick = () => {
    selectedStream = s;
    loadDepartments(streams[s]);
    show("department");
  };
  streamList.appendChild(b);
});

/* DEPARTMENT */
function loadDepartments(depts) {
  const d = document.getElementById("deptList");
  d.innerHTML = "";
  depts.forEach(dep => {
    const b = document.createElement("button");
    b.textContent = dep.toUpperCase();
    b.onclick = () => {
      selectedDept = dep;
      loadSemesters();
      show("semester");
    };
    d.appendChild(b);
  });
}

/* SEMESTER */
function loadSemesters() {
  const s = document.getElementById("semList");
  s.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("button");
    b.textContent = `Semester ${i}`;
    b.onclick = () => loadSubjects(i);
    s.appendChild(b);
  }
}

/* SUBJECTS */
function loadSubjects(sem) {
  selectedSem = sem;
  fetch(`data/${selectedDept}_sem${sem}.json`)
    .then(r => r.json())
    .then(data => {
      subjects = data;
      renderSubjects();
      document.getElementById("semTitle").textContent =
        `${selectedDept.toUpperCase()} – Semester ${sem}`;
      show("subjects");
    })
    .catch(() => alert("Subject file not found"));
}

function renderSubjects() {
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  subjects.forEach((sub, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <span>${sub.name} (${sub.credits})</span>
      <select id="g${i}">
        <option>S</option><option>A</option><option>B</option>
        <option>C</option><option>D</option><option>E</option><option>F</option>
      </select>
    `;
    list.appendChild(div);
  });
}

/* GPA */
document.getElementById("calcGPA").onclick = () => {
  let totalCredits = 0;
  let totalPoints = 0;

  subjects.forEach((s, i) => {
    const g = document.getElementById(`g${i}`).value;
    totalCredits += s.credits;
    totalPoints += gradePoints[g] * s.credits;
  });

  const gpa = (totalPoints / totalCredits).toFixed(2);
  saveSemester(selectedDept, selectedSem, gpa);
  updateResult();
  show("result");
};

/* BACK BUTTONS */
document.querySelectorAll(".back").forEach(b => {
  b.onclick = () => show(b.dataset.target);
});