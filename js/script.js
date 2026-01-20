/* ================= GLOBAL STATE ================= */
let selectedStream = "";
let selectedDepartment = "";
let selectedSemester = 0;
let subjects = [];
let grades = {};
let semesterChart = null;

let savedSemesters =
  JSON.parse(localStorage.getItem("savedSemesters")) || [];

/* ================= CONSTANTS ================= */
const departments = {
  engineering: ["cse", "ise", "ece", "eee", "aa"],
  bcom: ["bcom"]
};

const gradePoints = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
};

/* ================= PAGE NAVIGATION ================= */
function showPage(id) {
  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ================= STREAM & DEPARTMENT ================= */
function selectStream(stream, btn) {
  selectedStream = stream;

  document.querySelectorAll(".cube-btn")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

function showDepartments() {
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";

  departments[selectedStream].forEach(dep => {
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = dep.toUpperCase();
    b.onclick = () => selectDepartment(dep, b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep, btn) {
  selectedDepartment = dep;

  document.querySelectorAll("#department-grid button")
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
    const b = document.createElement("button");
    b.className = "cube-btn";
    b.textContent = "Semester " + i;
    b.onclick = () => selectSemester(i, b);
    grid.appendChild(b);
  }
}

function selectSemester(sem, btn) {
  selectedSemester = sem;

  document.querySelectorAll("#semester-grid button")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
  loadSubjects();
}

/* ================= LOAD SUBJECTS ================= */
function loadSubjects() {
  grades = {};
  const list = document.getElementById("subjects-list");
  list.innerHTML = "Loading subjects...";

  const filePath = `data/${selectedDepartment}_sem${selectedSemester}.json`;
  console.log("📘 Loading:", filePath);

  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      subjects = data;
      renderSubjects();
    })
    .catch(err => {
      alert("❌ Subjects not loaded.\n" + filePath);
      console.error(err);
    });
}

/* ================= RENDER SUBJECTS ================= */
function renderSubjects() {
  const list = document.getElementById("subjects-list");
  list.innerHTML = "";

  subjects.forEach(sub => {
    const div = document.createElement("div");
    div.className = "subject";

    div.innerHTML = `
      <strong>${sub.code}</strong><br>
      ${sub.name} (${sub.credits} credits)

      <div class="grade-buttons">
        ${Object.keys(gradePoints).map(g =>
          `<button class="grade-btn"
            onclick="selectGrade('${sub.code}','${g}',this)">
            ${g}
          </button>`
        ).join("")}
      </div>
    `;

    list.appendChild(div);
  });

  showPage("subjects-page");
}

/* ================= SELECT GRADE (ANIMATED) ================= */
function selectGrade(code, grade, btn) {
  grades[code] = grade;

  btn.parentElement.querySelectorAll("button")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 300);
}

/* ================= CALCULATE CGPA ================= */
document.getElementById("calculate-btn").onclick = () => {
  let totalCredits = 0;
  let totalPoints = 0;

  for (let s of subjects) {
    if (!grades[s.code]) {
      alert("Please select all grades");
      return;
    }
    totalCredits += s.credits;
    totalPoints += s.credits * gradePoints[grades[s.code]];
  }

  const semesterGPA = +(totalPoints / totalCredits).toFixed(2);

  /* 🔒 OVERWRITE PROTECTION */
  const index = savedSemesters.findIndex(
    s => s.semester === selectedSemester
  );

  if (index >= 0) {
    savedSemesters[index].gpa = semesterGPA;
  } else {
    savedSemesters.push({
      semester: selectedSemester,
      gpa: semesterGPA
    });
  }

  localStorage.setItem(
    "savedSemesters",
    JSON.stringify(savedSemesters)
  );

  const cgpa =
    (savedSemesters.reduce((a, b) => a + b.gpa, 0) /
      savedSemesters.length).toFixed(2);

  document.getElementById("cgpa-display").innerText =
    "CGPA : " + cgpa;

  document.getElementById("percentage-display").innerText =
    "Percentage : " + (cgpa * 9.5).toFixed(2) + "%";

  document.getElementById("encouragement").innerText =
    getEncouragement(cgpa);

  showPage("result-page");
};

/* ================= ENCOURAGEMENT ================= */
function getEncouragement(cgpa) {
  if (cgpa >= 9) return "🌟 Outstanding! You are a topper!";
  if (cgpa >= 8) return "🔥 Excellent performance! Keep shining!";
  if (cgpa >= 7) return "👍 Very good! You’re doing great!";
  if (cgpa >= 6) return "🙂 Good effort! Aim higher next semester!";
  return "💪 Don’t give up! Improvement is coming!";
}

/* ================= GRAPH ================= */
function openGraph() {
  showPage("graph-page");

  const data = Array(8).fill(null);
  savedSemesters.forEach(s => {
    data[s.semester - 1] = s.gpa;
  });

  const ctx = document.getElementById("semesterChart");
  if (semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["S1","S2","S3","S4","S5","S6","S7","S8"],
      datasets: [{
        label: "Semester-wise CGPA",
        data,
        borderColor: "#6a11cb",
        backgroundColor: "rgba(106,17,203,0.3)",
        fill: true,
        tension: 0.4,
        pointRadius: 6
      }]
    }
  });
}

/* ================= SAVED SEMESTERS PAGE ================= */
function showSaved() {
  showPage("saved-page");

  const list = document.getElementById("saved-list");
  list.innerHTML = "";

  if (savedSemesters.length === 0) {
    list.innerHTML = "<p>No semesters saved yet</p>";
    return;
  }

  savedSemesters
    .sort((a, b) => a.semester - b.semester)
    .forEach(s => {
      list.innerHTML += `
        <div class="subject">
          <strong>Semester ${s.semester}</strong>
          <p>CGPA : ${s.gpa}</p>
        </div>
      `;
    });
}

/* ================= FAQ TOGGLE ================= */
document.querySelectorAll(".faq-question").forEach(q => {
  q.addEventListener("click", () => {
    const ans = q.nextElementSibling;
    ans.style.display =
      ans.style.display === "block" ? "none" : "block";
  });
});