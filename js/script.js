// ===== VARIABLES =====
let selectedStream = '';
let selectedDepartment = '';
let selectedSemester = 0;
let grades = {};
let semestersData = JSON.parse(localStorage.getItem('semestersData')) || [];

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const encouragementMsgs = [
  { min: 9, msg: "Excellent! Keep it up." },
  { min: 8, msg: "Good! Focus on improving slightly." },
  { min: 7, msg: "Average. Work harder next semester." },
  { min: 5, msg: "Below average. Study more." },
  { min: 0, msg: "Poor. You can do better!" }
];

// ===== NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== START BUTTON =====
document.getElementById('start-btn').onclick = () => showPage('stream-page');

// ===== STREAM BUTTONS =====
document.querySelectorAll('.stream-btn').forEach(btn => {
  btn.onclick = () => {
    selectedStream = btn.innerText;
    showPage('department-page');
  };
});

// ===== DEPARTMENT BUTTONS =====
document.querySelectorAll('.dept-btn').forEach(btn => {
  btn.onclick = () => {
    selectedDepartment = btn.dataset.dept;
    showPage('semester-page');
    loadSemesters();
  };
});

// ===== SEMESTERS =====
function loadSemesters() {
  const semDiv = document.getElementById('semesters');
  semDiv.innerHTML = '';
  for(let i=1; i<=8; i++){
    const btn = document.createElement('button');
    btn.classList.add('sem-btn');
    btn.innerText = 'Sem ' + i;
    btn.onclick = () => {
      selectedSemester = i;
      loadSubjects();
      showPage('subjects-page');
    };
    semDiv.appendChild(btn);
  }
}

// ===== LOAD SUBJECTS =====
async function loadSubjects(){
  const subjectsDiv = document.getElementById('subjects-list');
  subjectsDiv.innerHTML = '';
  grades = {};

  const fileName = `${selectedDepartment.toLowerCase()}_sem${selectedSemester}.json`;
  const response = await fetch(`data/${fileName}`);
  const subjects = await response.json();

  subjects.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `<span>${sub.code} - ${sub.name} (${sub.credit} cr)</span>`;
    const gradeDiv = document.createElement('div');
    ['S','A','B','C','D','E','F'].forEach(g => {
      const gBtn = document.createElement('button');
      gBtn.className = 'grade-btn';
      gBtn.innerText = g;
      gBtn.onclick = () => {
        grades[sub.code] = g;
        Array.from(gradeDiv.children).forEach(b => b.classList.remove('selected'));
        gBtn.classList.add('selected');
      };
      gradeDiv.appendChild(gBtn);
    });
    card.appendChild(gradeDiv);
    subjectsDiv.appendChild(card);
  });
}

// ===== CALCULATE GPA =====
document.getElementById('calculate-btn').onclick = () => {
  let totalPoints=0, totalCredits=0;
  for(let code in grades){
    const g = grades[code];
    const subDiv = Array.from(document.querySelectorAll('.subject-card')).find(c => c.innerText.includes(code));
    const cr = parseFloat(subDiv.innerText.match(/\(([\d.]+) cr\)/)[1]);
    totalPoints += gradePoints[g]*cr;
    totalCredits += cr;
  }
  const gpa = totalPoints/totalCredits;
  document.getElementById('gpa-display').innerText = 'GPA: '+gpa.toFixed(2);
  // CGPA calculation
  semestersData.push({dept:selectedDepartment, sem:selectedSemester, gpa:gpa});
  localStorage.setItem('semestersData', JSON.stringify(semestersData));
  const cgpa = semestersData.reduce((sum,s)=>sum+s.gpa,0)/semestersData.length;
  document.getElementById('cgpa-display').innerText = 'CGPA: '+cgpa.toFixed(2);
  document.getElementById('percentage-display').innerText = 'Percentage: '+(cgpa*9.5).toFixed(2)+'%';
  document.getElementById('encouragement').innerText = encouragementMsgs.find(m=>cgpa>=m.min).msg;
  renderChart();
};

// ===== CHART =====
function renderChart(){
  const ctx = document.getElementById('gpa-chart').getContext('2d');
  const labels = semestersData.map(s => 'Sem '+s.sem);
  const data = semestersData.map(s => s.gpa);
  if(window.gpaChart) window.gpaChart.destroy();
  window.gpaChart = new Chart(ctx,{
    type:'line',
    data:{
      labels:labels,
      datasets:[{
        label:'Semester GPA',
        data:data,
        borderColor:'#6a11cb',
        backgroundColor:'rgba(106,17,203,0.2)',
        fill:true,
        tension:0.3,
        pointBackgroundColor:'#2575fc',
        pointBorderColor:'#6a11cb',
        pointRadius:5
      }]
    },
    options:{ responsive:true, plugins:{legend:{display:true}} }
  });
}

// ===== FAQ TOGGLE =====
document.querySelectorAll('.faq-question').forEach(btn=>{
  btn.onclick = () => {
    btn.nextElementSibling.style.display = btn.nextElementSibling.style.display==='block' ? 'none' : 'block';
  };
});

// ===== BACK BUTTONS =====
document.getElementById('stream-back').onclick = () => showPage('start-page');
document.getElementById('dept-back').onclick = () => showPage('stream-page');
document.getElementById('sem-back').onclick = () => showPage('department-page');
document.getElementById('subjects-back').onclick = () => showPage('semester-page');
document.getElementById('faq-back').onclick = () => showPage('start-page');

// ===== FLOATING ICONS =====
document.getElementById('home-icon').onclick = () => showPage('start-page');
document.getElementById('save-icon').onclick = () => alert('Semester saved! Check GPA chart.');
document.getElementById('graph-icon').onclick = () => showPage('subjects-page');

// ===== INITIAL PAGE =====
showPage('start-page');