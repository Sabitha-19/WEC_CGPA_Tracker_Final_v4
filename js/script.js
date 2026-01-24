/* ================== GLOBAL VARIABLES ================== */
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;
let subjects = [];
let grades = {};
let savedSemesters = [];
let semesterChart = null;

const departments = {
  engineering: ["CSE", "ISE", "ECE", "EEE", "AA"],
  bcom: ["BCom"]
};

const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

/* ================== INITIALIZE ON PAGE LOAD ================== */
window.addEventListener('DOMContentLoaded', function () {
  console.log("Page loaded!");

  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const ans = this.nextElementSibling;
      const isOpen = ans.style.display === "block";

      document.querySelectorAll(".faq-answer").forEach(a => {
        a.style.display = "none";
      });

      ans.style.display = isOpen ? "none" : "block";
    });
  });

  loadSavedData();
});

/* ================== LOCAL STORAGE FUNCTIONS ================== */
function loadSavedData() {
  try {
    const saved = localStorage.getItem('wec_cgpa_data');
    if (saved) savedSemesters = JSON.parse(saved);
  } catch {
    savedSemesters = [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem('wec_cgpa_data', JSON.stringify(savedSemesters));
}

/* ================== PAGE NAVIGATION ================== */
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

/* ================== STREAM ================== */
function selectStream(stream, btn) {
  selectedStream = stream;
  document.querySelectorAll("#stream-page .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

/* ================== DEPARTMENT ================== */
function showDepartments() {
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";
  departments[selectedStream].forEach(dep => {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = dep;
    b.onclick = () => selectDepartment(dep.toLowerCase(), b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep, btn) {
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

/* ================== SEMESTER ================== */
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
  document.querySelectorAll("#semester-grid .cube-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

/* ================== LOAD SUBJECTS ================== */
function loadSubjects() {
  grades = {};
  subjects = [];

  const fileName = `${selectedDepartment}_sem${selectedSemester}.json`;
  const filePath = `data/${fileName}`;

  showPage("subjects-page");
  const box = document.getElementById("subjects-list");
  box.innerHTML = `<p style="text-align:center">Loading...</p>`;

  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      subjects = Array.isArray(data) ? data : data.subjects;
      renderSubjects();
    })
    .catch(err => {
      box.innerHTML = `<p style="color:red;text-align:center">${err.message}</p>`;
    });
}

/* ================== RENDER SUBJECTS (REPLACED ONLY) ================== */
function renderSubjects() {
  const box = document.getElementById("subjects-list");
  box.innerHTML = "";

  const container = document.createElement("div");
  container.style.cssText =
    "background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,.08)";

  subjects.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subject";

    const title = document.createElement("strong");
    title.textContent = `${sub.name} (${sub.credits} credits)`;

    const gradesDiv = document.createElement("div");
    gradesDiv.className = "grade-buttons";

    ["S", "A", "B", "C", "D", "E", "F"].forEach(g => {
      const btn = document.createElement("button");
      btn.className = "grade-btn";
      btn.textContent = g;

      btn.onclick = () => {
        gradesDiv.querySelectorAll(".grade-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        grades[sub.code] = g;
      };

      gradesDiv.appendChild(btn);
    });

    div.appendChild(title);
    div.appendChild(gradesDiv);
    container.appendChild(div);
  });

  box.appendChild(container);
}

/* ================== CALCULATE GPA ================== */
function calculateGPA() {
  let total = 0, credits = 0;

  subjects.forEach(s => {
    if (grades[s.code]) {
      total += gradePoints[grades[s.code]] * s.credits;
      credits += s.credits;
    }
  });

  if (!credits) return alert("Select at least one grade");

  const gpa = (total / credits).toFixed(2);
  document.getElementById("cgpa-display").innerText =
    `Semester ${selectedSemester} GPA: ${gpa}`;

  saveSemester(gpa);
  showPage("result-page");
}

/* ================== SAVE SEMESTER ================== */
function saveSemester(gpa) {
  savedSemesters = savedSemesters.filter(
    s => !(s.semester === selectedSemester && s.department === selectedDepartment)
  );

  savedSemesters.push({
    stream: selectedStream,
    department: selectedDepartment,
    semester: selectedSemester,
    gpa: parseFloat(gpa)
  });

  saveToLocalStorage();
}

/* ================== CGPA ================== */
function calculateCGPA() {
  if (!savedSemesters.length) return "0.00";
  return (
    savedSemesters.reduce((a, b) => a + b.gpa, 0) / savedSemesters.length
  ).toFixed(2);
}