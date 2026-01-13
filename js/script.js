// ===== GLOBAL STATE =====
let selectedDepartment = '';
let selectedSemester = 0;
let grades = {};

const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

// ===== PAGE NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== HEADER ICON ACTIONS =====
document.getElementById('home-icon').onclick = () => showPage('start-page');
document.getElementById('faq-icon').onclick = () => showPage('faq-page');
document.getElementById('graph-icon').onclick = () => showPage('subjects-page');
document.getElementById('print-icon').onclick = () => window.print();
document.getElementById('back-btn').onclick = () => history.back();

// ===== STREAM =====
function selectStream(_, btn) {
  activate(btn);
  loadDepartments();
  showPage('department-page');
}

// ===== DEPARTMENTS =====
function loadDepartments() {
  const d = document.getElementById('departments');
  d.innerHTML = '';

  ['cse', 'ece', 'eee'].forEach(dep => {
    const b = document.createElement('button');
    b.textContent = dep.toUpperCase();
    b.onclick = () => {
      selectedDepartment = dep;
      activate(b);
      loadSemesters();
      showPage('semester-page');
    };
    d.appendChild(b);
  });
}

// ===== SEMESTERS =====
function loadSemesters() {
  const s = document.getElementById('semesters');
  s.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const b = document.createElement('button');
    b.textContent = `Semester ${i}`;
    b.onclick = () => {
      selectedSemester = i;
      activate(b);
      loadSubjects();
    };
    s.appendChild(b);
  }
}

// ===== SUBJECTS =====
async function loadSubjects() {
  const list = document.getElementById('subjects-list');
  list.innerHTML = '';
  grades = {};

  try {
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json();

    data.subjects.forEach(sub => {
      const div = document.createElement('div');
      div.className = 'subject';
      div.dataset.code = sub.code;
      div.dataset.credits = sub.credits;

      div.innerHTML = `
        <strong>${sub.code} - ${sub.name} (${sub.credits} cr)</strong>
        <div class="grade-buttons">
          ${Object.keys(gradePoints)
            .map(g => `<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`)
            .join('')}
        </div>
      `;
      list.appendChild(div);
    });

    showPage('subjects-page');
  } catch (err) {
    alert('Subject data not found!');
    showPage('semester-page');
  }
}

// ===== GRADE SELECTION =====
function selectGrade(code, grade, btn) {
  grades[code] = grade;
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ===== BUTTON ACTIVE STATE =====
function activate(btn) {
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== CALCULATION =====
document.getElementById('calculate-btn').onclick = () => {
  let totalPoints = 0;
  let totalCredits = 0;

  const subjects = document.querySelectorAll('.subject');

  for (let s of subjects) {
    const code = s.dataset.code;
    const credits = parseFloat(s.dataset.credits);

    if (!grades[code]) {
      alert('Please select all grades before calculating.');
      return;
    }

    totalPoints += gradePoints[grades[code]] * credits;
    totalCredits += credits;
  }

  const gpa = (totalPoints / totalCredits).toFixed(2);
  const percentage = (gpa * 9.5).toFixed(2);

  document.getElementById('gpa').textContent = `GPA: ${gpa}`;
  document.getElementById('cgpa').textContent = `CGPA: ${gpa}`;
  document.getElementById('percentage').textContent = `Percentage: ${percentage}%`;
};