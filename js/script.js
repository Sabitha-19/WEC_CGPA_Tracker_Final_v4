// =====================
// GLOBAL STATE
// =====================
let selectedStream = '';
let selectedDepartment = '';
let selectedSemester = '';
let grades = {};
let savedSemesters = JSON.parse(localStorage.getItem('savedSemesters')) || [];

// Grade points
const gradePoints = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0
};

// =====================
// PAGE NAVIGATION
// =====================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Header icons
document.getElementById('home-icon')?.addEventListener('click', () => showPage('start-page'));
document.getElementById('graph-icon')?.addEventListener('click', () => showPage('graph-page'));

// =====================
// START BUTTON
// =====================
document.getElementById('start-btn')?.addEventListener('click', () => {
  showPage('stream-page');
});

// =====================
// STREAM SELECTION
// =====================
document.querySelectorAll('.stream-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.stream-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedStream = btn.dataset.stream;
    showPage('department-page');
  });
});

// =====================
// DEPARTMENT SELECTION
// =====================
document.querySelectorAll('.department-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.department-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDepartment = btn.dataset.department; // aa, bcom, cse, ece, ise
    showPage('semester-page');
  });
});

// =====================
// SEMESTER SELECTION
// =====================
document.querySelectorAll('.semester-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSemester = btn.dataset.semester; // 1..8
    loadSubjects();
  });
});

// =====================
// LOAD SUBJECTS (THIS WAS BROKEN BEFORE)
// =====================
function loadSubjects() {
  const filePath = `data/${selectedDepartment}_sem${selectedSemester}.json`;
  console.log("Loading:", filePath);

  fetch(filePath)
    .then(res => {
      if (!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      grades = {};
      const list = document.getElementById('subjects-list');
      list.innerHTML = '';

      data.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'subject';

        div.innerHTML = `
          <div>
            <strong>${sub.code}</strong><br>
            ${sub.name} (${sub.credits} credits)
          </div>
          <div class="grade-buttons">
            ${Object.keys(gradePoints).map(g =>
              `<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`
            ).join('')}
          </div>
        `;
        list.appendChild(div);
      });

      showPage('subjects-page');
    })
    .catch(err => {
      alert("Subjects file missing!\n" + filePath);
      console.error(err);
    });
}

// =====================
// GRADE SELECTION
// =====================
function selectGrade(code, grade, btn) {
  grades[code] = grade;
  btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// =====================
// CALCULATE GPA
// =====================
document.getElementById('calculate-btn')?.addEventListener('click', () => {
  let totalCredits = 0;
  let totalPoints = 0;

  document.querySelectorAll('.subject').forEach(sub => {
    const code = sub.querySelector('strong').innerText;
    const credits = parseInt(sub.innerHTML.match(/\((\d+) credits\)/)[1]);

    if (grades[code]) {
      totalCredits += credits;
      totalPoints += credits * gradePoints[grades[code]];
    }
  });

  if (totalCredits === 0) {
    alert("Please select grades");
    return;
  }

  const gpa = (totalPoints / totalCredits).toFixed(2);
  const percent = (gpa * 9.5).toFixed(2);

  document.getElementById('cgpa-display').innerText = gpa;
  document.getElementById('percentage-display').innerText = percent + "%";
  document.getElementById('encouragement').innerText =
    gpa >= 8 ? "Excellent 💜" : gpa >= 6 ? "Good Job 👍" : "Keep Going 🌱";

  showPage('result-page');
});

// =====================
// SAVE SEMESTER
// =====================
document.getElementById('save-btn')?.addEventListener('click', () => {
  savedSemesters.push({
    department: selectedDepartment,
    semester: selectedSemester,
    gpa: document.getElementById('cgpa-display').innerText
  });
  localStorage.setItem('savedSemesters', JSON.stringify(savedSemesters));
  alert("Semester saved 💾");
});

let semesterChart;

// Call this whenever you open graph page
function renderSemesterGraph() {

  // Prepare semester-wise GPA (Sem1 → Sem8)
  let semesterData = Array(8).fill(null);

  savedSemesters.forEach(s => {
    const index = parseInt(s.semester) - 1;
    semesterData[index] = parseFloat(s.gpa);
  });

  const ctx = document.getElementById('semesterChart').getContext('2d');

  // Destroy old chart if exists
  if (semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'],
      datasets: [{
        label: 'Semester GPA',
        data: semesterData,
        borderColor: '#6a11cb',
        backgroundColor: 'rgba(106,17,203,0.25)', // blue fill
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6a11cb',
        pointBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 30,
            color: '#555',
            font: { size: 14 }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#666'
          },
          grid: {
            color: 'rgba(0,0,0,0.08)'
          }
        },
        x: {
          ticks: { color: '#666' },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

document.getElementById('graph-icon')?.addEventListener('click', () => {
  showPage('graph-page');
  renderSemesterGraph();
});