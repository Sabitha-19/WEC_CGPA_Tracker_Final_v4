let historyStack = [];
let gpaChart;

const state = {
  stream: null,
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  historyStack.push(id);
}

function goBack() {
  historyStack.pop();
  showTab(historyStack.pop() || "stream");
}

function goHome() {
  historyStack = [];
  showTab("stream");
}

/* STREAM */
function selectStream(s) {
  state.stream = s;

  if (s === "ENG") {
    showEngineeringDepartments();
    showTab("dept");
  } else {
    state.dept = "bcom";
    buildSemesters(6);
    showTab("sem");
  }
}

/* ENGINEERING DEPARTMENTS */
function showEngineeringDepartments() {
  const depts = ["ISE", "CSE", "ECE", "EEE", "AA"];
  const box = document.getElementById("deptList");
  box.innerHTML = "";

  depts.forEach(d => {
    const b = document.createElement("button");
    b.textContent = d;
    b.onclick = () => {
      state.dept = d.toLowerCase();
      buildSemesters(8);
      showTab("sem");
    };
    box.appendChild(b);
  });
}

/* SEMESTERS */
function buildSemesters(count) {
  const box = document.getElementById("semList");
  box.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const b = document.createElement("button");
    b.textContent = "Semester " + i;
    b.onclick = () => {
      state.sem = i;
      loadSubjects();
    };
    box.appendChild(b);
  }
}

/* LOAD SUBJECTS */
async function loadSubjects() {
  const path = `data/${state.dept}_sem${state.sem}.json`;

  try {
    const res = await fetch(path);
    const json = await res.json();
    state.subjects = json.subjects;
    renderSubjects();
    showTab("calc");
  } catch {
    alert("Subjects data missing!");
  }
}

/* RENDER */
function renderSubjects() {
  const box = document.getElementById("subjects");
  box.innerHTML = "";

  state.subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `<b>${s.code}</b> - ${s.name} (${s.credits})`;

    const grid = document.createElement("div");
    grid.className = "grade-grid";

    ["S","A","B","C","D","E","F"].forEach(g => {
      const c = document.createElement("div");
      c.className = "grade-cell";
      c.textContent = g;
      c.onclick = () => {
        grid.querySelectorAll(".grade-cell").forEach(x=>x.classList.remove("active"));
        c.classList.add("active");
        s.grade = g;
      };
      grid.appendChild(c);
    });

    div.appendChild(grid);
    box.appendChild(div);
  });
}

/* GPA */
function gradePoint(g) {
  return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g];
}

document.getElementById("calculate").onclick = () => {
  let total = 0, sum = 0;

  for (let s of state.subjects) {
    if (!s.grade) return alert("Select all grades");
    total += s.credits;
    sum += gradePoint(s.grade) * s.credits;
  }

  const gpa = (sum / total).toFixed(2);
  document.getElementById("result-gpa").textContent = "GPA: " + gpa;
  document.getElementById("result-msg").textContent = "Keep Improving!";
  showTab("result");
};

/* SAVE */
function saveSemester() {
  const key = `${state.dept.toUpperCase()}-Sem${state.sem}`;
  state.saved[key] = parseFloat(document.getElementById("result-gpa").textContent.split(":")[1]);
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));
  alert("Semester Saved!");
}

/* GRAPH */
function openGraph() {
  showTab("graph");

  const labels = Object.keys(state.saved);
  const data = Object.values(state.saved);

  if (gpaChart) gpaChart.destroy();

  gpaChart = new Chart(document.getElementById("gpaChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "GPA",
        data,
        borderColor: "#4f46e5",
        tension: 0.3,
        fill: true
      }]
    },
    options: { scales: { y: { min: 0, max: 10 } } }
  });
}