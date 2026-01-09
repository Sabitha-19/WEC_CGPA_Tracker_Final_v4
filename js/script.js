const DEPARTMENTS = ['ISE', 'CSE', 'ECE', 'EEE', 'AA', 'BCOM'];
let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick = () => showTab("dept");

const deptList = document.getElementById("deptList");
DEPARTMENTS.forEach(d => {
  const btn = document.createElement("button");
  btn.className = "dept-btn";
  btn.textContent = d;
  btn.onclick = () => { state.dept = d; buildSem(); showTab("sem"); };
  deptList.appendChild(btn);
});

function buildSem() {
  const semList = document.getElementById("semList");
  semList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("button");
    b.className = "sem-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => { state.sem = i; loadSyllabus(); };
    semList.appendChild(b);
  }
}

async function loadSyllabus() {
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  const subjectsEl = document.getElementById("subjects");
  const feedback = document.getElementById("feedback");
  try {
    const res = await fetch(path);
    if (!res.ok) throw "Missing file";
    const json = await res.json();
    state.subjects = json.subjects;
    renderSubjects();
    showTab("calc");
  } catch {
    feedback.textContent = "❌ Syllabus not found for this semester.";
  }
}

function renderSubjects() {
  const subjectsEl = document.getElementById("subjects");
  subjectsEl.innerHTML = "";
  state.subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `<b>${s.code}</b> - ${s.name} (${s.credits} credits)
      <div class="grade-grid">${['S','A','B','C','D','E','F']
        .map(g => `<div class="grade-cell" data-g="${g}">${g}</div>`).join("")}</div>`;
    subjectsEl.appendChild(div);
    div.querySelectorAll(".grade-cell").forEach(c => {
      c.onclick = () => {
        div.querySelectorAll(".grade-cell").forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        s.selected = c.dataset.g;
      };
    });
  });
}

function gradeToPoint(g) {
  return { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 }[g];
}

document.getElementById("calculate").onclick = () => {
  let tot = 0, wt = 0;
  for (const s of state.subjects) {
    if (!s.selected) return alert("Select all grades!");
    tot += s.credits;
    wt += gradeToPoint(s.selected) * s.credits;
  }
  const gpa = (wt / tot).toFixed(2);
  document.getElementById("totalCredits").textContent = tot;
  document.getElementById("gpa").textContent = gpa;

  document.getElementById("result-gpa").textContent = "GPA: " + gpa;
  document.getElementById("result-msg").textContent =
    gpa >= 9 ? "🌟 Outstanding!" :
    gpa >= 8 ? "💪 Excellent work!" :
    gpa >= 7 ? "👍 Good effort!" :
    gpa >= 6 ? "😊 Keep improving!" :
    "🔥 Don’t give up! Try again!";
  showTab("result");
};

document.getElementById("save").onclick = () => {
  const gpa = parseFloat(document.getElementById("gpa").textContent);
  if (!state.dept || !state.sem || !gpa) return;
  state.saved[`${state.dept}_Sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  renderSaved();
  showTab("saved");
};

function renderSaved() {
  const savedList = document.getElementById("savedList");
  const cgpaEl = document.getElementById("cgpa");
  savedList.innerHTML = "";
  let total = 0, count = 0;
  for (const [key, val] of Object.entries(state.saved)) {
    savedList.innerHTML += `<li>${key}: GPA ${val.toFixed(2)}</li>`;
    total += val; count++;
  }
  cgpaEl.textContent = count ? (total / count).toFixed(2) : "0.00";
}

let gpaChart = null;
function openGraph() {
  showTab("graph");
  const entries = Object.entries(state.saved)
    .sort((a,b) => parseInt(a[0].match(/sem(\d+)/i)[1]) - parseInt(b[0].match(/sem(\d+)/i)[1]));
  const labels = entries.map(e => e[0]);
  const data = entries.map(e => e[1]);
  const ctx = document.getElementById("gpaChart").getContext("2d");
  if (gpaChart) gpaChart.destroy();
  gpaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Semester GPA Comparison",
        data,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.1)",
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointBackgroundColor: "#4338ca"
      }]
    },
    options: { scales: { y: { min: 0, max: 10, ticks: { stepSize: 1 } } } }
  });
}