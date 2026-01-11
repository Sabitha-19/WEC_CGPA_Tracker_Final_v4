// ===== GLOBAL STATE =====
let state = {
  stream: "",
  dept: "",
  sem: "",
  saved: []   // semester-wise GPA
};

// ===== GRADE POINTS (CUBIC) =====
const grades = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

// ===== SECTION NAVIGATION =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ===== STREAM SELECTION =====
function selectStream(stream) {
  state.stream = stream;
  loadDepartments();
  showSection('department');
}

// ===== LOAD DEPARTMENTS =====
function loadDepartments() {
  const depts = ['CSE', 'ISE', 'ECE', 'EEE', 'AA'];
  const container = document.getElementById('deptButtons');
  container.innerHTML = '';

  depts.forEach(dep => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = dep;
    btn.onclick = () => {
      state.dept = dep;
      loadSemesters();
    };
    container.appendChild(btn);
  });
}

// ===== LOAD SEMESTERS =====
function loadSemesters() {
  const max = state.stream === 'Engineering' ? 8 : 6;
  const container = document.getElementById('semButtons');
  container.innerHTML = '';

  for (let i = 1; i <= max; i++) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = `Semester ${i}`;
    btn.onclick = () => {
      state.sem = i;
      loadSubjects();
    };
    container.appendChild(btn);
  }

  showSection('semester');
}

// ===== LOAD SUBJECTS (DEMO AUTO-LOAD) =====
function loadSubjects() {
  const list = document.getElementById('subjects');
  list.innerHTML = '';

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement('div');
    row.className = 'subject-row';

    row.innerHTML = `
      <span>Subject ${i}</span>
      <select>
        ${Object.keys(grades)
          .map(g => `<option value="${g}">${g}</option>`)
          .join('')}
      </select>
    `;
    list.appendChild(row);
  }

  showSection('grades');
}

// ===== GPA CALCULATION =====
function calculateGPA() {
  let total = 0;
  const selects = document.querySelectorAll('#subjects select');

  selects.forEach(sel => {
    total += grades[sel.value];
  });

  const gpa = (total / selects.length).toFixed(2);
  document.getElementById('gpa').innerText = gpa;

  showSection('result');
}

// ===== SAVE SEMESTER =====
function saveSemester() {
  const gpa = parseFloat(document.getElementById('gpa').innerText);
  state.saved.push(gpa);
  alert(`Semester ${state.saved.length} saved successfully!`);
}

// ===== CGPA → PERCENTAGE =====
function convertCGPA() {
  const cgpa = parseFloat(document.getElementById('cgpaInput').value);
  if (isNaN(cgpa)) return;

  const percent = (cgpa * 10).toFixed(1);
  document.getElementById('percent').innerText = percent + '%';
}

// ===== GRAPH =====
let chartInstance = null;

function drawGraph() {
  const canvas = document.getElementById('chart');
  if (!canvas) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: state.saved.map((_, i) => `Sem ${i + 1}`),
      datasets: [{
        label: 'GPA Progress',
        data: state.saved,
        borderColor: '#5a4fcf',
        backgroundColor: 'rgba(90,79,207,0.15)',
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10
        }
      }
    }
  });

  showSection('graphSection');
}