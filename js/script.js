/* ---------- GLOBAL STATE ---------- */
let state = {
  stream: "",
  dept: "",
  sem: 0,
  savedSemesters: JSON.parse(localStorage.getItem("wec_saved")) || []
};

/* ---------- GRADE POINTS ---------- */
const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

/* ---------- SUBJECT TEMPLATE (DEMO) ---------- */
/* Replace with your real subjects if needed */
function getSubjects(stream, sem) {
  if (stream === "Engineering") {
    return [
      { name: "Mathematics", credits: 4 },
      { name: "Core Subject", credits: 4 },
      { name: "Lab", credits: 2 },
      { name: "Elective", credits: 3 },
      { name: "Skill Course", credits: 1 }
    ];
  } else {
    return [
      { name: "Accounting", credits: 4 },
      { name: "Economics", credits: 3 },
      { name: "Business Law", credits: 3 },
      { name: "Statistics", credits: 2 },
      { name: "Skill Course", credits: 2 }
    ];
  }
}

/* ---------- SECTION NAVIGATION ---------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- STREAM ---------- */
function selectStream(stream) {
  state.stream = stream;
  loadDepartments();
  showSection("department");
}

/* ---------- DEPARTMENTS ---------- */
function loadDepartments() {
  const departments = ["CSE", "ISE", "ECE", "EEE", "AA"];
  const box = document.getElementById("deptButtons");
  box.innerHTML = "";

  departments.forEach(dep => {
    const btn = document.createElement("button");
    btn.textContent = dep;
    btn.onclick = () => {
      state.dept = dep;
      loadSemesters();
    };
    box.appendChild(btn);
  });
}

/* ---------- SEMESTERS ---------- */
function loadSemesters() {
  const maxSem = state.stream === "Engineering" ? 8 : 6;
  const box = document.getElementById("semButtons");
  box.innerHTML = "";

  for (let i = 1; i <= maxSem; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => {
      state.sem = i;
      loadSubjects();
    };
    box.appendChild(btn);
  }

  showSection("semester");
}

/* ---------- SUBJECT LOADING ---------- */
function loadSubjects() {
  const subjects = getSubjects(state.stream, state.sem);
  const list = document.getElementById("subjects");
  list.innerHTML = "";

  subjects.forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <div>
        <strong>${sub.name}</strong><br>
        <small>${sub.credits} Credits</small>
      </div>
      <select data-credits="${sub.credits}">
        <option value="">Grade</option>
        ${Object.keys(gradePoints).map(g => `<option>${g}</option>`).join("")}
      </select>
    `;
    list.appendChild(div);
  });

  showSection("grades");
}

/* ---------- GPA CALCULATION (CREDIT BASED) ---------- */
function calculateGPA() {
  let totalCredits = 0;
  let totalPoints = 0;

  document.querySelectorAll("select").forEach(sel => {
    const grade = sel.value;
    const credits = parseInt(sel.dataset.credits);

    if (!grade) {
      alert("Please select all grades");
      return;
    }

    totalCredits += credits;
    totalPoints += credits * gradePoints[grade];
  });

  const gpa = (totalPoints / totalCredits).toFixed(2);
  document.getElementById("gpa").innerText = gpa;
  showSection("result");
}

/* ---------- SAVE SEMESTER ---------- */
function saveSemester() {
  const gpa = parseFloat(document.getElementById("gpa").innerText);
  state.savedSemesters[state.sem - 1] = gpa;

  localStorage.setItem("wec_saved", JSON.stringify(state.savedSemesters));
  alert("Semester saved successfully!");
}

/* ---------- CGPA TO PERCENTAGE ---------- */
function convertToPercentage() {
  const cgpa = parseFloat(document.getElementById("cgpaInput").value);
  if (isNaN(cgpa)) {
    document.getElementById("percent").innerText = "Enter valid CGPA";
    return;
  }
  document.getElementById("percent").innerText = (cgpa * 10).toFixed(1) + "%";
}

/* ---------- GRAPH ---------- */
let chart;
function showGraph() {
  showSection("graph");

  const ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: state.savedSemesters.map((_, i) => `Sem ${i + 1}`),
      datasets: [{
        label: "Semester GPA",
        data: state.savedSemesters,
        borderColor: "#5b4bcf",
        backgroundColor: "rgba(91,75,207,0.15)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });
}

/* ---------- BOTTOM NAV ---------- */
document.getElementById("navHome").onclick = () => showSection("start");
document.getElementById("navGraph").onclick = showGraph;
document.getElementById("navSaved").onclick = showGraph;