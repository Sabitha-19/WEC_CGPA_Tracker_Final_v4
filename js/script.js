let chartInstance = null;

function goBack(target) {
  showTab(target);
}

const DEPARTMENTS = ['ISE','CSE','ECE','EEE','AA'];
let state = { dept:null, sem:null, subjects:[], saved:{} };

const startBtn = document.getElementById('startBtn');
const deptList = document.getElementById('deptList');
const semList = document.getElementById('semList');
const subjectsEl = document.getElementById('subjects');
const feedback = document.getElementById('feedback');
const totalCreditsEl = document.getElementById('totalCredits');
const gpaEl = document.getElementById('gpa');
const cgpaEl = document.getElementById('cgpa');
const savedList = document.getElementById('savedList');

/* ---------------- TAB NAVIGATION ---------------- */
function showTab(id) {
  document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === "graph") drawGraph();
}

startBtn.onclick = () => showTab('dept');

/* ---------------- LOAD SAVED DATA ---------------- */
window.onload = () => {
  const stored = localStorage.getItem("wec_saved");
  if (stored) state.saved = JSON.parse(stored);
  renderSaved();
};

/* ---------------- DEPARTMENTS ---------------- */
DEPARTMENTS.forEach(d => {
  const btn = document.createElement('div');
  btn.className = 'dept-btn';
  btn.textContent = d;
  btn.onclick = () => {
    state.dept = d;
    buildSemButtons();
    showTab('sem');
  };
  deptList.appendChild(btn);
});

/* ---------------- SEMESTERS ---------------- */
function buildSemButtons() {
  semList.innerHTML = '';
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement('div');
    b.className = 'sem-btn';
    b.textContent = 'Semester ' + i;
    b.onclick = () => {
      state.sem = i;
      loadSyllabus();
    };
    semList.appendChild(b);
  }
}

/* ---------------- LOAD SYLLABUS ---------------- */
async function loadSyllabus() {
  feedback.textContent = 'Loading syllabus...';
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error();
    const json = await res.json();
    state.subjects = json.subjects || [];
    renderSubjects();
    showTab('calc');
  } catch {
    feedback.textContent = 'Syllabus not found.';
  }
}

/* ---------------- SUBJECTS ---------------- */
function renderSubjects() {
  subjectsEl.innerHTML = '';
  state.subjects.forEach(s => {
    const box = document.createElement('div');
    box.className = 'subject';
    box.innerHTML = `
      <strong>${s.code}</strong>
      <p>${s.name}</p>
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F']
          .map(g => `<div class="grade-cell" data-g="${g}">${g}</div>`).join('')}
      </div>
    `;
    subjectsEl.appendChild(box);

    box.querySelectorAll('.grade-cell').forEach(c => {
      c.onclick = () => {
        box.querySelectorAll('.grade-cell').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        s.selected = c.dataset.g;
      };
    });
  });
}

/* ---------------- GPA CALC ---------------- */
function gradeToPoint(g) {
  return { S:10, A:9, B:8, C:7, D:6, E:5, F:0 }[g] || 0;
}

document.getElementById('calculate').onclick = () => {
  let total = 0, weighted = 0;

  for (const s of state.subjects) {
    if (!s.selected) {
      feedback.textContent = "⚠️ Select all grades.";
      return;
    }
    total += Number(s.credits);
    weighted += gradeToPoint(s.selected) * Number(s.credits);
  }

  const gpa = (weighted / total).toFixed(2);
  gpaEl.textContent = gpa;

  let msg =
    gpa >= 9 ? "🌟 Outstanding!" :
    gpa >= 8 ? "💪 Excellent!" :
    gpa >= 7 ? "👍 Good job!" :
    gpa >= 6 ? "😊 Nice effort!" :
    gpa >= 5 ? "📘 Keep improving!" :
               "🔥 Don’t give up!";

  document.getElementById("result-gpa").textContent = "GPA: " + gpa;
  document.getElementById("result-msg").textContent = msg;

  showTab("result");
};

/* ---------------- SAVE SEMESTER ---------------- */
document.getElementById('save').onclick = () => {
  const gpa = parseFloat(gpaEl.textContent);
  if (!gpa) return alert("Calculate GPA first!");

  state.saved[`${state.dept}_Sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));

  renderSaved();
  showTab("saved");
};

/* ---------------- RENDER SAVED ---------------- */
function renderSaved() {
  savedList.innerHTML = '';
  let total = 0, count = 0;

  for (const [k,v] of Object.entries(state.saved)) {
    savedList.innerHTML += `<li>${k}: ${v.toFixed(2)}</li>`;
    total += v;
    count++;
  }

  cgpaEl.textContent = count ? (total / count).toFixed(2) : "0.00";
}

/* ---------------- GPA GRAPH ---------------- */
function drawGraph() {
  const labels = Object.keys(state.saved);
  const data = Object.values(state.saved);

  if (chartInstance) chartInstance.destroy();

  const ctx = document.getElementById("gpaChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA",
        data,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 10 } }
    }
  });
}
