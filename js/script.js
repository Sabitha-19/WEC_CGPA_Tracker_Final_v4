const DEPARTMENTS = ["ISE", "CSE", "ECE", "EEE", "AA", "BCOM"];

let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const deptList = document.getElementById("deptList");
const semList = document.getElementById("semList");
const subjectsEl = document.getElementById("subjects");
const feedback = document.getElementById("feedback");
const totalCreditsEl = document.getElementById("totalCredits");
const gpaEl = document.getElementById("gpa");
const cgpaEl = document.getElementById("cgpa");
const savedList = document.getElementById("savedList");

/* ---------- NAV ---------- */
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick = () => showTab("dept");

/* ---------- DEPARTMENTS ---------- */
DEPARTMENTS.forEach(d => {
  const btn = document.createElement("div");
  btn.className = "dept-btn";
  btn.textContent = d;
  btn.onclick = () => {
    state.dept = d;
    buildSemesters();
    showTab("sem");
  };
  deptList.appendChild(btn);
});

/* ---------- SEMESTERS ---------- */
function buildSemesters() {
  semList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const b = document.createElement("div");
    b.className = "sem-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => {
      state.sem = i;
      loadSyllabus();
    };
    semList.appendChild(b);
  }
}

/* ---------- LOAD SUBJECTS ---------- */
async function loadSyllabus() {
  feedback.textContent = "Loading syllabus...";

  const file = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  console.log("Loading:", file);

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("File not found");

    const json = await res.json();
    state.subjects = json.subjects;

    renderSubjects();
    showTab("calc");
    feedback.textContent = "";
  } catch (err) {
    console.error(err);
    feedback.textContent = "❌ Subjects not available for this semester.";
  }
}

/* ---------- SUBJECT UI ---------- */
function renderSubjects() {
  subjectsEl.innerHTML = "";
  state.subjects.forEach(sub => {
    const box = document.createElement("div");
    box.className = "subject";
    box.innerHTML = `
      <strong>${sub.code}</strong> - ${sub.name}
      <span>(${sub.credits} credits)</span>
      <div class="grade-grid">
        ${["S","A","B","C","D","E","F"]
          .map(g => `<div class="grade-cell">${g}</div>`).join("")}
      </div>
    `;
    subjectsEl.appendChild(box);

    box.querySelectorAll(".grade-cell").forEach(cell => {
      cell.onclick = () => {
        box.querySelectorAll(".grade-cell").forEach(c => c.classList.remove("active"));
        cell.classList.add("active");
        sub.selected = cell.textContent;
      };
    });
  });
}

/* ---------- GPA ---------- */
function gradeToPoint(g) {
  return { S:10, A:9, B:8, C:7, D:6, E:5, F:0 }[g];
}

document.getElementById("calculate").onclick = () => {
  let total = 0, weighted = 0;

  for (const s of state.subjects) {
    if (!s.selected) {
      feedback.textContent = "⚠️ Select all grades.";
      return;
    }
    total += s.credits;
    weighted += gradeToPoint(s.selected) * s.credits;
  }

  const gpa = (weighted / total).toFixed(2);
  gpaEl.textContent = gpa;
  totalCreditsEl.textContent = total;

  showTab("result");
};

/* ---------- SAVE ---------- */
function saveSemester() {
  const key = `${state.dept}_sem${state.sem}`;
  state.saved[key] = parseFloat(gpaEl.textContent);
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  renderSaved();
  showTab("saved");
}

/* ---------- CGPA ---------- */
function renderSaved() {
  savedList.innerHTML = "";
  let sum = 0, count = 0;

  Object.entries(state.saved)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .forEach(([k,v])=>{
      savedList.innerHTML += `<li>${k.toUpperCase()} : ${v}</li>`;
      sum += v; count++;
    });

  cgpaEl.textContent = (sum / count || 0).toFixed(2);
}