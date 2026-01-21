/* ================= GLOBAL STATE ================= */
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;

let subjects = [];
let grades = {};

let savedSemesters = JSON.parse(localStorage.getItem("savedSemesters")) || [];
let semesterChart = null;

/* ================= CONSTANTS ================= */
const departments = {
  engineering: ["cse", "ise", "ece", "eee", "aa"],
  bcom: ["bcom"]
};

const gradePoints = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
};

/* ================= PAGE NAVIGATION ================= */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

/* ================= STREAM / DEPARTMENT ================= */
function selectStream(stream, btn) {
  selectedStream = stream;
  document.querySelectorAll(".cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

function showDepartments() {
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";

  departments[selectedStream].forEach(dep => {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = dep.toUpperCase();
    b.onclick = () => selectDepartment(dep, b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep, btn) {
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

/* ================= SEMESTER ================= */
function showSemesters() {
  const grid = document.getElementById("semester-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => selectSemester(i, b);
    grid.appendChild(b);
  }
}

function selectSemester(sem, btn) {
  selectedSemester = sem;
  document.querySelectorAll("#semester-grid button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

/* ================= LOAD SUBJECTS ================= */
function loadSubjects() {
  grades = {};

  fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`)
    .then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then(data => {
      subjects = data;
      renderSubjects();
    })
    .catch(() => alert("Subjects file not found"));
}

/* ================= RENDER SUBJECTS (BASIC) ================= */
function renderSubjects() {
  const box = document.getElementById("subjects-box");
  if (!box) return;

  box.innerHTML = "";

  subjects.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <span>${sub.name}</span>
      <select onchange="grades['${sub.code}']=this.value;calculateGPA()">
        <option value="">Grade</option>
        <option>S</option><option>A</option><option>B</option>
        <option>C</option><option>D</option><option>E</option><option>F</option>
      </select>
    `;
    box.appendChild(div);
  });
}

/* ================= GPA CALCULATION ================= */
function calculateGPA() {
  let total = 0, credits = 0;

  subjects.forEach(s => {
    const g = grades[s.code];
    if (g) {
      total += gradePoints[g] * s.credits;
      credits += s.credits;
    }
  });

  const gpa = credits ? (total / credits).toFixed(2) : "0.00";
  document.getElementById("gpa-display").innerText = `GPA: ${gpa}`;
}

/* ================= SAVE SEMESTER ================= */
function saveSemester() {
  if (!selectedSemester) {
    alert("Select semester first");
    return;
  }

  const gpaText = document.getElementById("gpa-display").innerText;
  const gpa = parseFloat(gpaText.split(":")[1]);

  if (!gpa) {
    alert("Calculate GPA first");
    return;
  }

  // Remove existing record for same semester
  savedSemesters = savedSemesters.filter(
    s => !(s.department === selectedDepartment && s.semester === selectedSemester)
  );

  savedSemesters.push({
    department: selectedDepartment,
    semester: selectedSemester,
    gpa: gpa
  });

  localStorage.setItem("savedSemesters", JSON.stringify(savedSemesters));
  alert(`Semester ${selectedSemester} saved 💾`);
}

/* ================= GRAPH ================= */
function openGraph() {
  showPage("graph-page");
  renderSemesterGraph();
}

function renderSemesterGraph() {
  let semesterData = Array(8).fill(null);

  savedSemesters.forEach(s => {
    semesterData[s.semester - 1] = s.gpa;
  });

  const ctx = document.getElementById("semesterChart").getContext("2d");

  if (semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Sem1","Sem2","Sem3","Sem4","Sem5","Sem6","Sem7","Sem8"],
      datasets: [{
        label: "Semester GPA",
        data: semesterData,
        borderColor: "#6a11cb",
        backgroundColor: "rgba(106,17,203,0.25)",
        fill: true,
        tension: 0.4,
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 10 }
      }
    }
  });
}

/* ================= SAVED LIST ================= */
function showSaved() {
  showPage("saved-page");
  const list = document.getElementById("saved-list");
  list.innerHTML = "";

  savedSemesters.forEach(s => {
    list.innerHTML += `<div class="subject">
      ${s.department.toUpperCase()} - Semester ${s.semester} : ${s.gpa}
    </div>`;
  });
}

/* ================= FAQ ================= */
function toggleFAQ() {
  document.getElementById("faq-section")?.classList.toggle("hidden");
}

/* ================= ICON ================= */
document.getElementById("graph-icon")?.addEventListener("click", openGraph);