let state = {
  stream: null, dept: null, sem: null, subjects: [],
  history: ["welcomeSection"],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const sections = {
  welcome: document.getElementById("welcomeSection"),
  department: document.getElementById("departmentSection"),
  semester: document.getElementById("semesterSection"),
  subjects: document.getElementById("subjectsSection"),
  result: document.getElementById("resultSection"),
  graph: document.getElementById("graphSection")
};

function showSection(name) {
  Object.values(sections).forEach(s => s.classList.add("hidden"));
  sections[name].classList.remove("hidden");
  if(state.history[state.history.length - 1] !== name) state.history.push(name);
}

// Back Logic
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.onclick = () => {
    state.history.pop();
    const prev = state.history[state.history.length - 1];
    showSection(prev);
  };
});

document.getElementById("homeBtn").onclick = () => {
  state.history = ["welcome"];
  showSection("welcome");
};

// Selection Logic
document.querySelectorAll(".stream-btn").forEach(btn => {
  btn.onclick = () => {
    state.stream = btn.dataset.stream;
    loadDepartments();
    showSection("department");
  };
});

function loadDepartments() {
  const list = document.getElementById("departmentList");
  list.innerHTML = "";
  const depts = state.stream === "engineering" ? ["ISE", "CSE", "ECE", "EEE", "ME"] : ["BCom"];
  depts.forEach(d => {
    const b = document.createElement("button");
    b.className = "sub-btn";
    b.textContent = d;
    b.onclick = () => { state.dept = d; showSection("semester"); loadSemesters(); };
    list.appendChild(b);
  });
}

function loadSemesters() {
  const list = document.getElementById("semesterList");
  list.innerHTML = "";
  for(let i=1; i<=8; i++) {
    const b = document.createElement("button");
    b.className = "sub-btn";
    b.textContent = `Semester ${i}`;
    b.onclick = () => { state.sem = i; loadSubjects(); };
    list.appendChild(b);
  }
}

function loadSubjects() {
  // Use your existing fetch logic here
  const path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  document.getElementById("semHeader").textContent = `${state.dept} - Sem ${state.sem}`;
  
  fetch(path)
    .then(r => r.json())
    .then(data => {
      state.subjects = data.subjects;
      renderSubjects();
      showSection("subjects");
    }).catch(() => alert("Data for this sem not found. Check your 'data' folder."));
}

function renderSubjects() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";
  state.subjects.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<b>${s.name}</b> (${s.credits} Credits)
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F'].map(g => `<div class="grade-cell" data-grade="${g}">${g}</div>`).join('')}
      </div>`;
    container.appendChild(div);
    
    div.querySelectorAll(".grade-cell").forEach(cell => {
      cell.onclick = () => {
        div.querySelectorAll(".grade-cell").forEach(c => c.classList.remove("active"));
        cell.classList.add("active");
        s.selected = cell.dataset.grade;
      };
    });
  });
}

function gradeToPoint(g) { return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g]; }

document.getElementById("calculateGPA").onclick = () => {
  let totalPoints = 0, totalCredits = 0;
  for(let s of state.subjects) {
    if(!s.selected) { alert("Select grades for all subjects"); return; }
    totalPoints += (s.credits * gradeToPoint(s.selected));
    totalCredits += s.credits;
  }
  const res = (totalPoints / totalCredits).toFixed(2);
  document.getElementById("gpa").textContent = res;
  document.getElementById("totalCredits").textContent = totalCredits;
  showSection("result");
};

function convertToPercentage() {
  const cgpa = document.getElementById("cgpaInput").value;
  if(!cgpa) return;
  const perc = (parseFloat(cgpa) * 10).toFixed(1); // Standard formula
  document.getElementById("percentResult").innerHTML = `Approx Percentage: <b>${perc}%</b>`;
}
