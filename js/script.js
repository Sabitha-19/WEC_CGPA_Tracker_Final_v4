// State
let state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const sections = {
  stream: document.getElementById("streamSection"),
  department: document.getElementById("departmentSection"),
  semester: document.getElementById("semesterSection"),
  subjects: document.getElementById("subjectsSection"),
  result: document.getElementById("resultSection"),
  graph: document.getElementById("graphSection")
};

function showSection(sectionName) {
  Object.values(sections).forEach(s => s.classList.add("hidden"));
  sections[sectionName].classList.remove("hidden");
}

// Stream selection
document.querySelectorAll(".stream-btn").forEach(btn => {
  btn.onclick = () => {
    state.stream = btn.dataset.stream;
    loadDepartments();
    showSection("department");
  }
});

const departmentList = document.getElementById("departmentList");
const semesterList = document.getElementById("semesterList");
const subjectsDiv = document.getElementById("subjects");

const engineeringDepts = ["ISE", "CSE", "ECE", "EEE", "AA"];
const bcomDepts = ["BCom"];

function loadDepartments() {
  departmentList.innerHTML = "";
  const depts = state.stream === "engineering" ? engineeringDepts : bcomDepts;
  depts.forEach(d => {
    const btn = document.createElement("button");
    btn.textContent = d;
    btn.onclick = () => {
      state.dept = d;
      loadSemesters();
      showSection("semester");
    };
    departmentList.appendChild(btn);
  });
}

function loadSemesters() {
  semesterList.innerHTML = "";
  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => { state.sem = i; loadSubjects(); };
    semesterList.appendChild(btn);
  }
}

// Load subjects from JSON
function loadSubjects() {
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  fetch(path)
    .then(r => r.json())
    .then(data => {
      state.subjects = data.subjects;
      renderSubjects();
      showSection("subjects");
    })
    .catch(() => alert("Subjects JSON not found!"));
}

function renderSubjects() {
  subjectsDiv.innerHTML = "";
  state.subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `<b>${s.code}</b> - ${s.name} (${s.credits})<div class="grade-grid">${['S','A','B','C','D','E','F'].map(g=>`<span class="grade-cell" data-grade="${g}">${g}</span>`).join("")}</div>`;
    subjectsDiv.appendChild(div);
    div.querySelectorAll(".grade-cell").forEach(c => {
      c.onclick = () => {
        div.querySelectorAll(".grade-cell").forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        s.selected = c.dataset.grade;
      }
    });
  });
}

// Calculate GPA
document.getElementById("calculateGPA").onclick = () => {
  let totalCredits = 0, totalPoints = 0;
  for (const s of state.subjects) {
    if (!s.selected) { alert("Select all grades"); return; }
    totalCredits += s.credits;
    totalPoints += s.credits * gradeToPoint(s.selected);
  }
  const gpa = (totalPoints / totalCredits).toFixed(2);
  document.getElementById("totalCredits").textContent = totalCredits;
  document.getElementById("gpa").textContent = gpa;
  showSection("result");
}

function gradeToPoint(g) { return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g]; }

// Navigation buttons
document.getElementById("homeBtn").onclick = () => showSection("stream");
document.getElementById("graphBtn").onclick = () => drawGraph();
document.getElementById("saveBtn").onclick = () => saveSemester();

// Save GPA
function saveSemester() {
  const gpa = parseFloat(document.getElementById("gpa").textContent);
  if (!gpa || !state.dept || !state.sem) return;
  state.saved[`${state.dept}_sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  alert("Semester saved!");
}

// Graph
let chartInstance = null;
function drawGraph() {
  showSection("graph");
  const labels = Object.keys(state.saved).sort();
  const data = Object.values(state.saved).sort();
  const ctx = document.getElementById("gpaChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "line",
    data: { labels, datasets:[{ label:"GPA", data, borderColor:"#4f46e5", backgroundColor:"rgba(79,70,229,0.1)", tension:0.3, fill:true, pointRadius:6 }]},
    options: { responsive:true, scales:{ y:{ min:0, max:10 } } }
  });
}