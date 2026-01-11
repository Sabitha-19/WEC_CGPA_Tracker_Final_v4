// ===== Variables =====
const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const streamsDiv = document.getElementById('streams');
const departmentsDiv = document.getElementById('departments');
const semestersDiv = document.getElementById('semesters');
const subjectsList = document.getElementById('subjects-list');
const calculateBtn = document.getElementById('calculate-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const gpaDisplay = document.getElementById('gpa-display');
const cgpaDisplay = document.getElementById('cgpa-display');
const percentageDisplay = document.getElementById('percentage-display');
const encouragementDisplay = document.getElementById('encouragement');

const homeIcon = document.getElementById('home-icon');
const graphIcon = document.getElementById('graph-icon');

const gradePoints = { "S":10,"A":9,"B":8,"C":7,"D":6,"E":5,"F":0 };
const encouragements = [
  { min:9,msg:"Excellent work! Keep it up!" },
  { min:8,msg:"Very good! You can reach the top!" },
  { min:7,msg:"Good! Focus on improving slightly." },
  { min:5,msg:"Average. Need more effort." },
  { min:0,msg:"Work harder! You can improve!" }
];

let selectedStream='', selectedDepartment='', selectedSemester=0;
let subjects=[], grades={};
let semesterGPAs = JSON.parse(localStorage.getItem('semesterGPAs')) || Array(8).fill(null);

// ===== Navigation =====
function showPage(id){
  pages.forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateNavHighlight(id);
}

function updateNavHighlight(id){
  homeIcon.style.opacity = (id==='start-page')?1:0.5;
  graphIcon.style.opacity = (id==='subjects-page')?1:0.5;
}

// Stepwise Back Navigation
document.querySelectorAll('.back-btn').forEach(b => {
  b.addEventListener('click', () => {
    if (document.getElementById('stream-page').classList.contains('active')) showPage('start-page');
    else if (document.getElementById('department-page').classList.contains('active')) showPage('stream-page');
    else if (document.getElementById('semester-page').classList.contains('active')) showPage('department-page');
    else if (document.getElementById('subjects-page').classList.contains('active')) showPage('semester-page');
  });
});

startBtn.addEventListener('click',()=>showPage('stream-page'));
homeIcon.addEventListener('click',()=>showPage('start-page'));
graphIcon.addEventListener('click',()=>showPage('subjects-page'));

// Streams
document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    selectedStream = btn.dataset.stream;
    showDepartments(); showPage('department-page');
  });
});

// Departments
const departments = { engineering:["CSE","ISE","ECE","EEE","AA"], bcom:["BCOM"] };
function showDepartments(){
  departmentsDiv.innerHTML='';
  departments[selectedStream].forEach(dep=>{
    const b=document.createElement('button'); b.textContent=dep;
    b.addEventListener('click',()=>{
      selectedDepartment=dep.toLowerCase(); showSemesters(); showPage('semester-page');
    });
    departmentsDiv.appendChild(b);
  });
}

// Semesters
function showSemesters(){
  semestersDiv.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button'); b.textContent=`Semester ${i}`;
    b.addEventListener('click',()=>{
      selectedSemester=i; loadSubjects(); showPage('subjects-page');
    });
    semestersDiv.appendChild(b);
  }
}

// Load Subjects
async function loadSubjects(){
  subjectsList.innerHTML=''; grades={};
  try{
    const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data = await res.json(); subjects = data.subjects;
    subjects.forEach(s=>{
      const div=document.createElement('div'); div.className='subject';
      div.innerHTML=`<span>${s.code} - ${s.name} (${s.credits}cr)</span>`;
      const gradeDiv=document.createElement('div'); gradeDiv.className='grade-buttons';
      ["S","A","B","C","D","E","F"].forEach(g=>{
        const btn=document.createElement('button'); btn.textContent=g;
        btn.addEventListener('click',()=>{
          grades[s.code]=g;
          Array.from(gradeDiv.children).forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
        });
        gradeDiv.appendChild(btn);
      });
      div.appendChild(gradeDiv); subjectsList.appendChild(div);
    });
    // Load saved grades
    const saved=JSON.parse(localStorage.getItem(`${selectedDepartment}_sem${selectedSemester}`))||{};
    Object.keys(saved).forEach