let state = { stream: null, dept: null, sem: null, history: ["welcomeSection"], subjects: [] };

function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (state.history[state.history.length - 1] !== id) state.history.push(id);
}

// Back Buttons
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.onclick = () => {
    if (state.history.length > 1) {
      state.history.pop();
      showSection(state.history[state.history.length - 1]);
    }
  };
});

// Home Button
document.getElementById("homeBtn").onclick = () => {
  state.history = ["welcomeSection"];
  showSection("welcomeSection");
};

// Stream Selection
document.querySelectorAll(".stream-btn").forEach(btn => {
  btn.onclick = () => {
    state.stream = btn.dataset.stream;
    loadDepartments();
    showSection("departmentSection");
  };
});

// Load Departments
function loadDepartments() {
  const list = document.getElementById("departmentList");
  list.innerHTML = "";
  const depts = state.stream === "engineering" 
    ? ["ISE", "CSE", "ECE", "EEE", "ME"] 
    : ["BCom_General", "BCom_CS"];
  
  depts.forEach(d => {
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    b.textContent = d.replace('_', ' ');
    b.onclick = () => { 
      state.dept = d; 
      loadSemesters(); 
      showSection("semesterSection"); 
    };
    list.appendChild(b);
  });
}

// Load Semesters
function loadSemesters() {
  const list = document.getElementById("semesterList");
  list.innerHTML = "";
  const maxSem = state.stream === "engineering" ? 8 : 6;
  for (let i = 1; i <= maxSem; i++) {
    const b = document.createElement("button");
    b.className = "grid-item-btn";
    b.textContent = `Semester ${i}`;
    b.onclick = () => { 
      state.sem = i; 
      loadSubjects(); 
    };
    list.appendChild(b);
  }
}

// Load Subjects from JSON
function loadSubjects() {
  const deptName = state.dept.toLowerCase().replace(' ', '');
  const path = `data/${deptName}_sem${state.sem}.json`;
  fetch(path)
    .then(r => r.json())
    .then(data => {
      state.subjects = data.subjects;
      renderSubjects();
      showSection("subjectsSection");
    })
    .catch(() => alert(`JSON file not found: ${path}`));
}

// Render Subjects
function renderSubjects() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";
  state.subjects.forEach((s, idx) => {
    const div = document.createElement("div");
    div.className = "subject-card";
    div.innerHTML = `
      <div><b>${s.name}</b> (${s.credits})</div>
      <div class="grade-row">
        ${['S','A','B','C','D','E','F'].map(g => 
          `<div class="g-box" onclick="setGrade(${idx},'${g}',this)">${g}</div>`).join('')}
      </div>`;
    container.appendChild(div);
  });
}

// Set Grade
function setGrade(i, g, el) {
  state.subjects[i].selected = g;
  el.parentElement.querySelectorAll('.g-box').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// GPA Calculation
document.getElementById("calculateGPA").onclick = () => {
  const gradePoints = {S:10, A:9, B:8, C:7, D:6, E:5, F:0};
  let totalPts = 0, totalCredits = 0;

  for (let s of state.subjects) {
    if (!s.selected) {
      alert(`Please select grades for all subjects!`);
      return;
    }
    totalPts += s.credits * gradePoints[s.selected];
    totalCredits += s.credits;
  }

  const gpa = (totalPts / totalCredits).toFixed(2);
  document.getElementById("gpa").textContent = gpa;
  showSection("resultSection");
};

// CGPA to Percentage
function convertToPercentage() {
  const val = parseFloat(document.getElementById("cgpaInput").value);
  if (isNaN(val)) {
    document.getElementById("percentResult").textContent = "Enter a valid CGPA!";
    return;
  }
  const percent = (val * 10).toFixed(1);
  document.getElementById("percentResult").innerHTML = `Percentage: <b>${percent}%</b>`;
}