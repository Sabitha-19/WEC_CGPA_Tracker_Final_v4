// ---------- main.js ----------

// Grade points
const gradePoints = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

// Elements
const sections = document.querySelectorAll("section");
const continueBtn = document.getElementById("continueBtn");
const streamList = document.getElementById("streamList");
const deptList = document.getElementById("deptList");
const semList = document.getElementById("semList");
const subjectList = document.getElementById("subjectList");
const semTitle = document.getElementById("semTitle");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const percentageEl = document.getElementById("percentage");

// Streams & Departments
const streams = {
  Engineering: ["CSE","ISE","ECE","EEE","AA"],
  BCom: ["BCOM"]
};

let selectedStream = "";
let selectedDept = "";
let selectedSem = 1;
let subjectsData = [];

// ------------------- NAVIGATION -------------------
function showSection(id) {
  sections.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Back buttons
document.querySelectorAll(".back").forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.dataset.target));
});

// Continue button on start page
continueBtn.addEventListener("click", () => {
  alert(`CGPA is Cumulative Grade Point Average. \n
It is calculated by weighted average of all semesters.\n
Formula: GPA = Σ(grade points × credits) / Σ(credits)\n
Tips: Aim for high grades, maintain consistency, and track your CGPA regularly.`);
  showSection("stream");
});

// ------------------- STREAMS -------------------
function loadStreams() {
  streamList.innerHTML = "";
  for (let s in streams) {
    const btn = document.createElement("button");
    btn.textContent = s;
    btn.onclick = () => selectStream(s, btn);
    streamList.appendChild(btn);
  }
}

function selectStream(name, btn) {
  selectedStream = name;
  highlightActive(streamList, btn);
  loadDepartments();
  showSection("department");
}

// ------------------- DEPARTMENTS -------------------
function loadDepartments() {
  deptList.innerHTML = "";
  streams[selectedStream].forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d;
    btn.onclick = () => selectDepartment(d, btn);
    deptList.appendChild(btn);
  });
}

function selectDepartment(dept, btn) {
  selectedDept = dept;
  highlightActive(deptList, btn);
  loadSemesters();
  showSection("semester");
}

// ------------------- SEMESTERS -------------------
function loadSemesters() {
  semList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement("button");
    btn.textContent = "Semester " + i;
    btn.onclick = () => selectSemester(i, btn);
    semList.appendChild(btn);
  }
}

function selectSemester(sem, btn) {
  selectedSem = sem;
  highlightActive(semList, btn);
  loadSubjects();
  showSection("subjects");
}

// ------------------- SUBJECTS -------------------
function loadSubjects() {
  subjectList.innerHTML = "";
  semTitle.textContent = `${selectedDept} - Semester ${selectedSem}`;

  const filePath = `data/${selectedDept.toLowerCase()}_sem${selectedSem}.json`;

  fetch(filePath)
    .then(res => res.json())
    .then(data => {
      // Handle both array or object wrapping
      subjectsData = Array.isArray(data) ? data : data.subjects || [];
      if (subjectsData.length === 0) {
        alert("No subjects found in JSON.");
        return;
      }
      displaySubjects(subjectsData);
    })
    .catch(err => {
      alert("Subject file not found");
      console.error(err);
    });
}

function displaySubjects(subjects) {
  subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "subject-item";
    div.innerHTML = `
      <span>${s.name} (${s.credits} Cr)</span>
      <select>
        <option value="S">S</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
      </select>
    `;
    subjectList.appendChild(div);
  });
}

// ------------------- GPA / CGPA -------------------
document.getElementById("calcGPA").addEventListener("click", () => {
  let totalCredits = 0;
  let totalPoints = 0;

  subjectList.querySelectorAll(".subject-item").forEach(item => {
    const grade = item.querySelector("select").value;
    const credits = parseInt(item.textContent.match(/\((\d+) Cr\)/)[1]);
    totalCredits += credits;
    totalPoints += credits * gradePoints[grade];
  });

  const gpa = (totalPoints / totalCredits).toFixed(2);
  gpaEl.textContent = gpa;

  // Save semester GPA
  saveSemester(selectedDept, selectedSem, gpa);

  // Update CGPA
  const cgpa = calculateCGPA();
  cgpaEl.textContent = cgpa.toFixed(2);
  percentageEl.textContent = (cgpa * 9.5).toFixed(2) + "%";

  // Encouragement
  if (cgpa >= 9) alert("Excellent! Keep up the outstanding performance!");
  else if (cgpa >= 8) alert("Great! You are doing very well.");
  else if (cgpa >= 7) alert("Good! Stay consistent and improve.");
  else alert("Keep going! You can boost your CGPA with consistent effort.");

  showChart();
  showSection("result");
});

// ------------------- HIGHLIGHT ACTIVE BUTTON -------------------
function highlightActive(container, activeBtn) {
  container.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

// ------------------- CGPA & LOCAL STORAGE -------------------
function saveSemester(dept, sem, gpa) {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  if (!saved[dept]) saved[dept] = {};
  saved[dept][sem] = parseFloat(gpa);
  localStorage.setItem("semesters", JSON.stringify(saved));
}

function calculateCGPA() {
  const saved = JSON.parse(localStorage.getItem("semesters") || "{}");
  let total = 0, count = 0;
  for (let dept in saved) {
    for (let sem in saved[dept]) {
      total += saved[dept][sem];
      count++;
    }
  }
  return count === 0 ? 0 : total / count;
}

// ------------------- INITIALIZE -------------------
loadStreams();
showSection("intro");