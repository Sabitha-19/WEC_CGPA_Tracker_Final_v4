// ===== VARIABLES =====
const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const subjectsList = document.getElementById('subjects-list');

const gpaDisplay = document.getElementById('gpa-display');
const cgpaDisplay = document.getElementById('cgpa-display');
const percentageDisplay = document.getElementById('percentage-display');
const encouragementDisplay = document.getElementById('encouragement');

const homeIcon = document.getElementById('home-icon');
const graphIcon = document.getElementById('graph-icon');
const faqIcon = document.getElementById('faq-icon');
const historyIcon = document.getElementById('history-icon');

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

const encouragements = [
  { min: 9, msg: "Excellent 🌟" },
  { min: 8, msg: "Very Good 👍" },
  { min: 7, msg: "Good 🙂" },
  { min: 5, msg: "Average 😐" },
  { min: 0, msg: "Need Improvement 💪" }
];

let selectedStream = '';
let selectedDepartment = '';
let selectedSemester = 0;
let subjects = [];
let grades = {};
let semesterGPAs = JSON.parse(localStorage.getItem('semesterGPAs')) || [];

// ===== PAGE NAVIGATION =====
function showPage(id){
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// Header navigation
startBtn.onclick = () => showPage('stream-page');
homeIcon.onclick = () => showPage('start-page');
graphIcon.onclick = () => showPage('subjects-page');

if (faqIcon) faqIcon.onclick = () => showPage('faq-page');
if (historyIcon) historyIcon.onclick = showHistory;

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn=>{
  btn.onclick = () => showPage('start-page');
});

// ===== STREAM =====
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.onclick = ()=>{
    selectedStream = btn.dataset.stream;
    showDepartments();
    showPage('department-page');
  };
});

// ===== DEPARTMENT =====
const departments = {
  engineering: ["CSE","ISE","ECE","EEE","AIML"],
  bcom: ["BCOM"]
};

function showDepartments(){
  const div = document.getElementById('departments');
  div.innerHTML = '';
  departments[selectedStream].forEach(dep=>{
    const b = document.createElement('button');
    b.textContent = dep;
    b.onclick = ()=>{
      selectedDepartment = dep.toLowerCase();
      showSemesters();
      showPage('semester-page');
    };
    div.appendChild(b);
  });
}

// ===== SEMESTERS =====
function showSemesters(){
  const div = document.getElementById('semesters');
  div.innerHTML = '';
  for(let i=1;i<=8;i++){
    const b = document.createElement('button');
    b.textContent = `Semester ${i}`;
    b.onclick = ()=>{
      selectedSemester = i;
      loadSubjects();
      showPage('subjects-page');
    };
    div.appendChild(b);
  }
}

// ===== LOAD SUBJECTS =====
async function loadSubjects(){
  subjectsList.innerHTML = '';
  grades = {};

  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json();
    subjects = data.subjects;

    subjects.forEach(sub=>{
      const div = document.createElement('div');
      div.className = 'subject';

      div.innerHTML = `<span>${sub.code} - ${sub.name}</span>`;
      const gradeDiv = document.createElement('div');
      gradeDiv.className = 'grade-buttons';

      Object.keys(gradePoints).forEach(g=>{
        const btn = document.createElement('button');
        btn.textContent = g;
        btn.onclick = ()=>{
          grades[sub.code] = g;
          gradeDiv.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
        };
        gradeDiv.appendChild(btn);
      });

      div.appendChild(gradeDiv);
      subjectsList.appendChild(div);
    });

  }catch{
    subjectsList.innerHTML = "<p>No subjects found</p>";
  }
}

// ===== CALCULATE GPA & CGPA =====
document.getElementById('calculate-btn').onclick = ()=>{
  if(Object.keys(grades).length !== subjects.length){
    alert("Select all grades");
    return;
  }

  let total = 0, credits = 0;
  subjects.forEach(s=>{
    total += gradePoints[grades[s.code]] * s.credits;
    credits += s.credits;
  });

  const gpa = (total/credits).toFixed(2);
  semesterGPAs[selectedSemester-1] = parseFloat(gpa);
  localStorage.setItem('semesterGPAs', JSON.stringify(semesterGPAs));

  const validGPAs = semesterGPAs.filter(Boolean);
  const cgpa = (validGPAs.reduce((a,b)=>a+b,0) / validGPAs.length).toFixed(2);

  gpaDisplay.textContent = `GPA: ${gpa}`;
  cgpaDisplay.textContent = `CGPA: ${cgpa}`;
  percentageDisplay.textContent = `Percentage: ${(cgpa*9.5).toFixed(2)}%`;

  encouragementDisplay.textContent =
    encouragements.find(e => cgpa >= e.min).msg;

  updateChart();
};

// ===== CHART =====
const ctx = document.getElementById('gpa-chart');
const gpaChart = new Chart(ctx,{
  type:'line',
  data:{
    labels:['S1','S2','S3','S4','S5','S6','S7','S8'],
    datasets:[{
      label:'Semester GPA',
      data: semesterGPAs,
      fill:true,
      tension:0.4
    }]
  },
  options:{ scales:{ y:{ min:0, max:10 } } }
});

function updateChart(){
  gpaChart.data.datasets[0].data = semesterGPAs;
  gpaChart.update();
}

// ===== HISTORY PAGE =====
function showHistory(){
  const container = document.getElementById('history-cards');
  container.innerHTML = '';

  semesterGPAs.forEach((gpa, index)=>{
    if(gpa){
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <h3>Semester ${index+1}</h3>
        <p>GPA: ${gpa}</p>
      `;
      container.appendChild(card);
    }
  });

  showPage('history-page');
}