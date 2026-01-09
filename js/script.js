/**********************
 * GLOBAL STATE
 **********************/
const DEPARTMENTS = ["ISE", "CSE", "ECE", "EEE", "AA"];

let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

/**********************
 * ELEMENTS
 **********************/
const deptList = document.getElementById("deptList");
const semList = document.getElementById("semList");
const subjectsEl = document.getElementById("subjects");
const feedback = document.getElementById("feedback");
const totalCreditsEl = document.getElementById("totalCredits");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const savedList = document.getElementById("savedList");

/**********************
 * TAB NAVIGATION
 **********************/
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick = () => showTab("dept");

/**********************
 * DEPARTMENTS
 **********************/
DEPARTMENTS.forEach(dept => {
  const btn = document.createElement("div");
  btn.className = "dept-btn";
  btn.textContent = dept;
  btn.onclick = () => {
    state.dept = dept;
    buildSemesters();
    showTab("sem");
  };
  deptList.appendChild(btn);
});

/**********************
 * SEMESTERS (1–8)
 **********************/
function buildSemesters() {
  semList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement("div");
    btn.className = "sem-btn";
    btn.textContent = "Semester " + i;
    btn.onclick = () => {
      state.sem = i;
      loadSyllabus();
    };
    semList.appendChild(btn);
  }
}

/**********************
 * LOAD SUBJECTS
 **********************/
async function loadSyllabus() {
  feedback.textContent = "Loading syllabus...";
  const file = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Missing");
    const json = await res.json();
    state.subjects = json.subjects || [];
    renderSubjects();
    showTab("calc");
  } catch {
    feedback.textContent = "❌ Syllabus not found";
  }
}

/**********************
 * RENDER SUBJECTS
 **********************/
function renderSubjects() {
  subjectsEl.innerHTML = "";
  state.subjects.forEach(sub => {
    const box = document.createElement("div");
    box.className = "subject";
    box.innerHTML = `
      <strong>${sub.code}</strong> - ${sub.name} (${sub.credits})
      <div class="grade-grid">
        ${["S","A","B","C","D","E","F"]
          .map(g => `<div class="grade-cell" data-g="${g}">${g}</div>`)
          .join("")}
      </div>
    `;
    subjectsEl.appendChild(box);

    box.querySelectorAll(".grade-cell").forEach(cell => {
      cell.onclick = () => {
        box.querySelectorAll(".grade-cell").forEach(c => c.classList.remove("active"));
        cell.classList.add("active");
        sub.selected = cell.dataset.g;
      };
    });
  });
}

/**********************
 * GPA CALCULATION
 **********************/
function gradeToPoint(g) {
  return { S:10, A:9, B:8, C:7, D:6, E:5, F:0 }[g] || 0;
}

document.getElementById("calculate").onclick = () => {
  let total = 0, weighted = 0;

  for (const s of state.subjects) {
    if (!s.selected) {
      feedback.textContent = "⚠️ Select all grades";
      return;
    }
    total += s.credits;
    weighted += gradeToPoint(s.selected) * s.credits;
  }

  const gpa = (weighted / total).toFixed(2);
  gpaEl.textContent = gpa;
  totalCreditsEl.textContent = total;

  document.getElementById("result-gpa").textContent = "GPA: " + gpa;
  document.getElementById("result-msg").textContent =
    gpa >= 9 ? "🌟 Outstanding Performance!" :
    gpa >= 8 ? "💪 Excellent Work!" :
    gpa >= 7 ? "👍 Good Job!" :
    "📘 Keep Improving!";

  showTab("result");
};

/**********************
 * SAVE SEMESTER
 **********************/
function saveSemester() {
  if (!state.dept || !state.sem) return;

  const gpa = parseFloat(gpaEl.textContent);
  if (!gpa) return;

  const key = `${state.dept}_sem${state.sem}`;
  state.saved[key] = gpa;

  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  renderSaved();
  showTab("saved");
}

/**********************
 * RENDER SAVED + CGPA
 **********************/
function renderSaved() {
  savedList.innerHTML = "";
  let sum = 0, count = 0;

  Object.entries(state.saved).forEach(([k, v]) => {
    savedList.innerHTML += `<li>${k.toUpperCase()} : ${v.toFixed(2)}</li>`;
    sum += v;
    count++;
  });

  cgpaEl.textContent = count ? (sum / count).toFixed(2) : "0.00";
}

/**********************
 * GPA GRAPH (SORTED)
 **********************/
let gpaChartInstance = null;

function openGraph() {
  showTab("graph");

  const entries = Object.entries(state.saved);

  // Sort Sem 1 → Sem 8
  entries.sort((a, b) => {
    const semA = parseInt(a[0].match(/sem(\d+)/i)[1]);
    const semB = parseInt(b[0].match(/sem(\d+)/i)[1]);
    return semA - semB;
  });

  const labels = entries.map(e => e[0].replace("_", " ").toUpperCase());
  const data = entries.map(e => e[1]);

  if (!labels.length) return;

  const ctx = document.getElementById("gpaChart").getContext("2d");

  if (gpaChartInstance) gpaChartInstance.destroy();

  gpaChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA Comparison",
        data,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: "#4338ca"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}