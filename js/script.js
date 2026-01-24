/* ================= GLOBAL VARIABLES ================= */
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;

let subjects = [];
let grades = {};
let savedSemesters = [];
let semesterChart = null;

const departments = {
  engineering: ["cse", "ise", "ece", "eee", "aa"],
  bcom: ["bcom"]
};

const gradePoints = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
};

/* ================= PAGE NAVIGATION ================= */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );
  document.getElementById(pageId)?.classList.add("active");
}

/* ================= STREAM ================= */
function selectStream(stream, btn) {
  selectedStream = stream;
  document.querySelectorAll("#stream-page .cube-btn")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  showDepartments();
  showPage("department-page");
}

/* ================= DEPARTMENT ================= */
function showDepartments() {
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";

  departments[selectedStream].forEach(dep => {
    const btn = document.createElement("button");
    btn.className = "cube-btn";
    btn.textContent = dep.toUpperCase();
    btn.onclick = () => selectDepartment(dep, btn);
    grid.appendChild(btn);
  });
}

function selectDepartment(dep, btn) {
  selectedDepartment = dep;
  document.querySelectorAll("#department-grid .cube-btn")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  showSemesters();
  showPage("semester-page");
}

/* ================= SEMESTER ================= */
function showSemesters() {
  const grid = document.getElementById("semester-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const btn = document.createElement("button");
    btn.className = "cube-btn";
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => selectSemester(i, btn);
    grid.appendChild(btn);
  }
}

function selectSemester(sem, btn) {
  selectedSemester = sem;
  document.querySelectorAll("#semester-grid .cube-btn")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  loadSubjects();
}

/* ================= SUBJECT LOADING (GITHUB SAFE) ================= */
function loadSubjects() {
  grades = {};

  const basePath = window.location.pathname.includes("WEC_CGPA_Tracker_Final_v4")
    ? "/WEC_CGPA_Tracker_Final_v4/"
    : "/";

  fetch(`${basePath}data/${selectedDepartment}_sem${selectedSemester}.json`)
    .then(res => {
      if (!res.ok) throw new Error("JSON not found");
      return res.json();
    })
    .then(data => {
      subjects = data;
      renderSubjects();
      showPage("subjects-page");
    })
    .catch(err => {
      alert("Subject file not found!");
      console.error(err);
    });
}

/* ================= SUBJECT RENDER ================= */
function renderSubjects() {
  const box = document.getElementById("subjects-list");
  box.innerHTML = "";

  subjects.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <strong>${sub.name}</strong>
      <select onchange="grades['${sub.code}']=this.value">
        <option value="">Grade</option>
        <option>S</option><option>A</option><option>B</option>
        <option>C</option><option>D</option><option>E</option><option>F</option>
      </select>
    `;
    box.appendChild(div);
  });
}

/* ================= ENCOURAGEMENT ================= */
function getEncouragement(score, type = "GPA") {
  if (score >= 9)
    return `🌟 Outstanding! Your ${type} is excellent. Keep shining!`;
  if (score >= 8)
    return `🔥 Very good! You're doing great. Aim even higher!`;
  if (score >= 7)
    return `👍 Good work! Stay consistent and improve.`;
  if (score >= 6)
    return `💪 You passed! Push a little harder next time.`;
  return `🌱 Don’t give up. Every topper once struggled.`;
}

/* ================= GPA & CGPA ================= */
function calculateGPA() {
  let total = 0, credits = 0;

  subjects.forEach(s => {
    const g = grades[s.code];
    if (g) {
      total += gradePoints[g] * s.credits;
      credits += s.credits;
    }
  });

  const gpa = credits ? (total / credits).toFixed(2) : "0.00";

  document.getElementById("cgpa-display").innerText =
    `Semester GPA: ${gpa}`;

  document.getElementById("encouragement-text").innerText =
    getEncouragement(parseFloat(gpa), "GPA");

  saveSemester(gpa);
  showPage("result-page");
}

/* ================= SAVE SEMESTER ================= */
function saveSemester(gpa) {
  savedSemesters = savedSemesters.filter(
    s => s.semester !== selectedSemester
  );

  savedSemesters.push({
    semester: selectedSemester,
    gpa: parseFloat(gpa)
  });

  document.getElementById("cgpa-message").innerText =
    getEncouragement(parseFloat(calculateCGPA()), "CGPA");
}

/* ================= CGPA ================= */
function calculateCGPA() {
  if (savedSemesters.length === 0) return "0.00";

  let total = 0;
  savedSemesters.forEach(s => total += s.gpa);
  return (total / savedSemesters.length).toFixed(2);
}

/* ================= SAVED LIST ================= */
function showSaved() {
  showPage("saved-page");
  const list = document.getElementById("saved-list");

  list.innerHTML = `
    <div class="cgpa-box">
      <h3>Overall CGPA</h3>
      <span>${calculateCGPA()}</span>
    </div>
  `;

  if (savedSemesters.length === 0) {
    list.innerHTML += "<p>No CGPA data saved</p>";
    return;
  }

  savedSemesters.forEach(s => {
    list.innerHTML += `
      <div class="subject">
        Semester ${s.semester} – GPA: <b>${s.gpa}</b>
      </div>
    `;
  });
}

/* ================= GRAPH ================= */
function openGraph() {
  showPage("graph-page");

  const data = Array(8).fill(null);
  savedSemesters.forEach(s => data[s.semester - 1] = s.gpa);

  const ctx = document.getElementById("semesterChart").getContext("2d");
  if (semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets: [{
        label: "Semester GPA",
        data,
        borderColor: "#6a11cb",
        backgroundColor: "rgba(106,17,203,0.25)",
        fill: true,
        tension: 0.4,
        pointRadius: 6
      }]
    },
    options: {
      scales: {
        y: { min: 0, max: 10 }
      }
    }
  });
}

/* ================= FAQ TOGGLE ================= */
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const ans = btn.nextElementSibling;

    document.querySelectorAll(".faq-answer").forEach(a => {
      if (a !== ans) a.style.display = "none";
    });

    ans.style.display =
      ans.style.display === "block" ? "none" : "block";
  });
});

/* ================= FAQ SECTION TOGGLE ================= */
function toggleFAQ() {
  const faq = document.getElementById("faq-section");
  faq.classList.toggle("hidden");

  // Always go to start page when FAQ opens
  showPage("start-page");
}

document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const ans = btn.nextElementSibling;

    document.querySelectorAll(".faq-answer").forEach(a => {
      if (a !== ans) a.style.display = "none";
    });

    ans.style.display =
      ans.style.display === "block" ? "none" : "block";
  });
});