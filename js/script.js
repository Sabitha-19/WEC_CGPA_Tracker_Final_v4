/* =========================
   GRADE POINT REFERENCE
========================= */
const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

/* =========================
   STREAM & DEPARTMENTS
========================= */
const departments = {
  engineering: ["CSE", "ISE", "ECE", "EEE", "AA"],
  bcom: ["BCOM"]
};

/* =========================
   GLOBAL STATE
========================= */
let state = {
  stream: null,
  dept: null,
  sem: null,
  grades: {},
  gpaHistory: Array(8).fill(null)
};

let chartInstance = null;

/* =========================
   SECTION NAVIGATION
========================= */
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

/* =========================
   START FLOW
========================= */
function startApp() {
  showSection("infoSection");
}

function goToStream() {
  showSection("streamSection");
}

/* =========================
   STREAM SELECTION
========================= */
function selectStream(stream) {
  state.stream = stream;
  state.dept = null;
  state.sem = null;

  const deptList = document.getElementById("deptList");
  deptList.innerHTML = "";

  departments[stream].forEach(dep => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = dep;
    btn.onclick = () => selectDepartment(dep);
    deptList.appendChild(btn);
  });

  showSection("departmentSection");
}

/* =========================
   DEPARTMENT SELECTION
========================= */
function selectDepartment(dep) {
  state.dept = dep;

  const semList = document.getElementById("semList");
  semList.innerHTML = "";

  const maxSem = state.stream === "engineering" ? 8 : 6;

  for (let i = 1; i <= maxSem; i++) {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => selectSemester(i);
    semList.appendChild(btn);
  }

  showSection("semesterSection");
}

/* =========================
   SEMESTER SELECTION
========================= */
async function selectSemester(sem) {
  state.sem = sem;
  state.grades = {};

  document.getElementById("semTitle").textContent = `Semester ${sem}`;
  const subjectList = document.getElementById("subjectList");
  subjectList.innerHTML = "";

  const deptKey = state.dept.toLowerCase();
  const filePath = `data/${deptKey}_sem${sem}.json`;

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error("File not found");

    const subjects = await res.json();

    subjects.forEach((sub, index) => {
      const card = document.createElement("div");
      card.className = "subject-card";

      card.innerHTML = `
        <div class="subject-info">
          <h4>${sub.name}</h4>
          <span>${sub.credits} Credits</span>
        </div>
        <select onchange="state.grades[${index}] = gradePoints[this.value]">
          <option value="">Select Grade</option>
          ${Object.keys(gradePoints)
            .map(g => `<option value="${g}">${g}</option>`)
            .join("")}
        </select>
      `;

      subjectList.appendChild(card);
    });

  } catch (err) {
    subjectList.innerHTML =
      "<p class='error'>Subjects not available for this semester.</p>";
  }

  showSection("subjectsSection");
}

/* =========================
   GPA CALCULATION
========================= */
async function calculateGPA() {
  const deptKey = state.dept.toLowerCase();
  const filePath = `data/${deptKey}_sem${state.sem}.json`;

  const res = await fetch(filePath);
  const subjects = await res.json();

  let totalPoints = 0;
  let totalCredits = 0;

  for (let i = 0; i < subjects.length; i++) {
    if (state.grades[i] === undefined) {
      alert("Please select grades for all subjects");
      return;
    }

    totalPoints += state.grades[i] * subjects[i].credits;
    totalCredits += subjects[i].credits;
  }

  const gpa = (totalPoints / totalCredits).toFixed(2);
  state.gpaHistory[state.sem - 1] = Number(gpa);

  document.getElementById("gpaValue").textContent = gpa;
  document.getElementById("cgpaValue").textContent = calculateCGPA();

  drawGraph();
  showSection("resultSection");
}

/* =========================
   CGPA CALCULATION
========================= */
function calculateCGPA() {
  const valid = state.gpaHistory.filter(v => v !== null);
  if (valid.length === 0) return "0.00";

  const cgpa = valid.reduce((a, b) => a + b, 0) / valid.length;
  return cgpa.toFixed(2);
}

/* =========================
   CGPA → PERCENTAGE
========================= */
function convertToPercentage() {
  const cgpa = parseFloat(document.getElementById("cgpaInput").value);

  if (isNaN(cgpa)) {
    document.getElementById("percentageResult").textContent =
      "Enter valid CGPA";
    return;
  }

  const percent = (cgpa * 10).toFixed(1);
  document.getElementById("percentageResult").textContent =
    `Percentage: ${percent}%`;
}

/* =========================
   GRAPH (Chart.js)
========================= */
function drawGraph() {
  const ctx = document.getElementById("gpaChart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: state.gpaHistory.map((_, i) => `Sem ${i + 1}`),
      datasets: [{
        label: "Semester GPA",
        data: state.gpaHistory,
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124,58,237,0.15)",
        tension: 0.35,
        borderWidth: 3,
        fill: true
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

/* =========================
   INITIAL LOAD
========================= */
window.onload = () => {
  showSection("startSection");
};