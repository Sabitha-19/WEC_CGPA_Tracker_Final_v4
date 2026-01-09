/* ===============================
   GLOBAL STATE & CONSTANTS
================================ */
const DEPARTMENTS = ["ISE", "CSE", "ECE", "EEE", "AA"];

let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: {}
};

let chartInstance = null;

/* ===============================
   DOM REFERENCES
================================ */
const startBtn = document.getElementById("startBtn");
const deptList = document.getElementById("deptList");
const semList = document.getElementById("semList");
const subjectsEl = document.getElementById("subjects");
const feedback = document.getElementById("feedback");
const totalCreditsEl = document.getElementById("totalCredits");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const savedList = document.getElementById("savedList");

/* ===============================
   TAB NAVIGATION
================================ */
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack(target) {
  showTab(target);
}

/* ===============================
   INITIAL LOAD
================================ */
window.onload = () => {
  const stored = localStorage.getItem("wec_saved");
  if (stored) state.saved = JSON.parse(stored);
};

/* ===============================
   START BUTTON
================================ */
startBtn.onclick = () => showTab("dept");

/* ===============================
   DEPARTMENT BUTTONS
================================ */
DEPARTMENTS.forEach(dept => {
  const btn = document.createElement("div");
  btn.className = "dept-btn";
  btn.textContent = dept;
  btn.onclick = () => {
    state.dept = dept;
    buildSemesterButtons();
    showTab("sem");
  };
  deptList.appendChild(btn);
});

/* ===============================
   SEMESTER BUTTONS
================================ */
function buildSemesterButtons() {
  semList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement("div");
    btn.className = "sem-btn";
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => {
      state.sem = i;
      loadSyllabus();
    };
    semList.appendChild(btn);
  }
}

/* ===============================
   LOAD SYLLABUS JSON
================================ */
async function loadSyllabus() {
  feedback.textContent = "Loading syllabus...";
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error("File missing");

    const json = await res.json();
    state.subjects = json.subjects || [];
    renderSubjects();
    showTab("calc");
  } catch {
    feedback.textContent = "❌ Syllabus not available.";
  }
}

/* ===============================
   RENDER SUBJECTS
================================ */
function renderSubjects() {
  subjectsEl.innerHTML = "";

  state.subjects.forEach(sub => {
    const box = document.createElement("div");
    box.className = "subject";

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <strong>${sub.code}</strong>
        <span>${sub.credits} credits</span>
      </div>
      <div>${sub.name}</div>
      <div class="grade-grid">
        ${["S","A","B","C","D","E","F"]
          .map(g => `<div class="grade-cell" data-grade="${g}">${g}</div>`)
          .join("")}
      </div>
    `;

    subjectsEl.appendChild(box);

    box.querySelectorAll(".grade-cell").forEach(cell => {
      cell.onclick = () => {
        box.querySelectorAll(".grade-cell").forEach(c => c.classList.remove("active"));
        cell.classList.add("active");
        sub.selected = cell.dataset.grade;
      };
    });
  });
}

/* ===============================
   GPA LOGIC
================================ */
function gradeToPoint(g) {
  return { S:10, A:9, B:8, C:7, D:6, E:5, F:0 }[g] || 0;
}

/* ===============================
   CALCULATE GPA → RESULT PAGE
================================ */
document.getElementById("calculate").onclick = () => {
  let totalCredits = 0;
  let weightedSum = 0;

  for (const sub of state.subjects) {
    if (!sub.selected) {
      feedback.textContent = "⚠️ Select all grades!";
      return;
    }
    totalCredits += Number(sub.credits);
    weightedSum += gradeToPoint(sub.selected) * Number(sub.credits);
  }

  const gpa = (weightedSum / totalCredits).toFixed(2);
  totalCreditsEl.textContent = totalCredits;
  gpaEl.textContent = gpa;

  let msg = "";
  if (gpa >= 9) msg = "🌟 Outstanding performance!";
  else if (gpa >= 8) msg = "💪 Excellent work!";
  else if (gpa >= 7) msg = "👍 Good progress!";
  else if (gpa >= 6) msg = "😊 Keep improving!";
  else msg = "🔥 Don’t give up!";

  document.getElementById("result-gpa").textContent = `Your GPA: ${gpa}`;
  document.getElementById("result-msg").textContent = msg;

  showTab("result");
};

/* ===============================
   SAVE SEMESTER → GRAPH
================================ */
document.getElementById("save").onclick = () => {
  const gpa = parseFloat(gpaEl.textContent);
  if (!gpa) {
    alert("Calculate GPA first!");
    return;
  }

  state.saved[`${state.dept}_Sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));

  renderSaved();
  drawGraph();
  showTab("graph");
};

/* ===============================
   RENDER SAVED + CGPA
================================ */
function renderSaved() {
  savedList.innerHTML = "";
  let total = 0, count = 0;

  for (const [key, val] of Object.entries(state.saved)) {
    const li = document.createElement("li");
    li.textContent = `${key}: GPA ${val.toFixed(2)}`;
    savedList.appendChild(li);
    total += val;
    count++;
  }

  cgpaEl.textContent = count ? (total / count).toFixed(2) : "0.00";
}

/* ===============================
   📊 DRAW GPA GRAPH (ICON PAGE)
================================ */
function drawGraph() {
  const labels = Object.keys(state.saved);
  const values = Object.values(state.saved);
  if (!labels.length) return;

  const colors = [
    "#ef4444","#22c55e","#3b82f6","#f59e0b",
    "#8b5cf6","#14b8a6","#ec4899","#64748b"
  ];

  const ctx = document.getElementById("gpaChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA",
        data: values,
        borderColor: "#4f46e5",
        borderWidth: 3,
        pointBackgroundColor: colors.slice(0, values.length),
        pointRadius: 6,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 10 }
      }
    }
  });
}
