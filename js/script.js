const startBtn = document.getElementById('start-btn');
const pages = document.querySelectorAll('.page');
const deptButtonsDiv = document.getElementById('dept-buttons');
const semButtonsDiv = document.getElementById('sem-buttons');
const subjectsList = document.getElementById('subjects-list');
const gpaResult = document.getElementById('gpa-result');
const calculateGpaBtn = document.getElementById('calculate-gpa');

const backFromSelection = document.getElementById('back-from-selection');
const backFromSubjects = document.getElementById('back-from-subjects');
const backFromChart = document.getElementById('back-from-chart');

const homeBtn = document.getElementById('home-btn');
const chartBtn = document.getElementById('chart-btn');

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const gradeEmojis = { S:'🎉', A:'👍', B:'🙂', C:'😐', D:'😕', E:'😌', F:'😢' };

const departments = ["CSE","ISE","ECE","EEE","AA","BCOM"];
let selectedDept = null;
let selectedSem = null;
let subjectsData = [];

startBtn.addEventListener('click', ()=>{ showPage('selection-page'); loadDepartments(); });

function showPage(id){
  pages.forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Back buttons
backFromSelection.onclick = ()=>showPage('start-page');
backFromSubjects.onclick = ()=>showPage('selection-page');
backFromChart.onclick = ()=>showPage('start-page');
homeBtn.onclick = ()=>showPage('start-page');
chartBtn.onclick = ()=>showPage('chart-page');

// Load Departments
function loadDepartments(){
  deptButtonsDiv.innerHTML = '';
  departments.forEach(d=>{
    let btn = document.createElement('button');
    btn.textContent = d;
    btn.onclick = ()=>{
      selectedDept=d;
      loadSemesters();
    }
    deptButtonsDiv.appendChild(btn);
  });
}

// Load Semesters
function loadSemesters(){
  semButtonsDiv.innerHTML='';
  for(let i=1;i<=8;i++){
    let btn=document.createElement('button');
    btn.textContent='Semester '+i;
    btn.onclick=()=>{
      selectedSem=i;
      loadSubjects();
    }
    semButtonsDiv.appendChild(btn);
  }
  showPage('selection-page');
}

// Load subjects from JSON
async function loadSubjects(){
  const response = await fetch(`data/${selectedDept.toLowerCase()}_sem${selectedSem}.json`);
  subjectsData = await response.json();
  displaySubjects();
}

function displaySubjects(){
  subjectsList.innerHTML='';
  subjectsData.subjects.forEach((sub, idx)=>{
    let div=document.createElement('div');
    div.className='subject';
    div.innerHTML=`<span>${sub.code}: ${sub.name} (${sub.credits} cr)</span>`;
    let gradeDiv=document.createElement('div');
    gradeDiv.className='grade-buttons';
    ['S','A','B','C','D','E','F'].forEach(g=>{
      let gBtn=document.createElement('button');
      gBtn.textContent=g;
      gBtn.onclick=()=>{
        gradeDiv.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
        gBtn.classList.add('selected');
      }
      gradeDiv.appendChild(gBtn);
    });
    div.appendChild(gradeDiv);
    subjectsList.appendChild(div);
  });
  showPage('subjects-page');
}

// Calculate GPA
calculateGpaBtn.onclick=()=>{
  let totalPoints=0, totalCredits=0;
  subjectsData.subjects.forEach((sub, idx)=>{
    const grade=subjectsList.children[idx].querySelector('.grade-buttons button.selected')?.textContent;
    if(!grade) return;
    totalPoints += gradePoints[grade]*sub.credits;
    totalCredits += sub.credits;
  });
  const gpa = (totalPoints/totalCredits).toFixed(2);
  const emoji = (totalPoints/totalCredits>0)?gradeEmojis[getOverallGrade(totalPoints/totalCredits)]:'';
  gpaResult.innerHTML=`GPA: ${gpa} ${emoji}`;
  saveSemesterGPA(selectedDept,selectedSem,gpa);
  drawChart();
}

function getOverallGrade(gpa){
  if(gpa>=9) return 'S';
  if(gpa>=8) return 'A';
  if(gpa>=7) return 'B';
  if(gpa>=6) return 'C';
  if(gpa>=5) return 'D';
  if(gpa>=4) return 'E';
  return 'F';
}

// LocalStorage save & chart
function saveSemesterGPA(dept,sem,gpa){
  let stored=JSON.parse(localStorage.getItem('cgpa_data')||'{}');
  stored[`${dept}_sem${sem}`]=parseFloat(gpa);
  localStorage.setItem('cgpa_data',JSON.stringify(stored));
}

function drawChart(){
  const ctx=document.getElementById('cgpa-chart').getContext('2d');
  let stored=JSON.parse(localStorage.getItem('cgpa_data')||'{}');
  const labels=Object.keys(stored);
  const data=Object.values(stored);
  if(window.cgpaChart) window.cgpaChart.destroy();
  window.cgpaChart=new Chart(ctx,{
    type:'line',
    data:{
      labels:labels,
      datasets:[{
        label:'GPA per semester',
        data:data,
        borderColor:'rgba(75, 192, 192, 1)',
        backgroundColor:'rgba(75, 192, 192, 0.2)',
        tension:0.2,
        fill:true
      }]
    },
    options:{ scales:{ y:{ beginAtZero:true, max:10 } } }
  });
}