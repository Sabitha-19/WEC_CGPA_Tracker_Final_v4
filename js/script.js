let selectedStream='';
let selectedDepartment='';
let selectedSemester=0;
let grades={};
let history=[];

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const subjectsList=document.getElementById('subjects-list');

// PAGE NAV
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('home-icon').onclick=()=>showPage('start-page');
document.getElementById('back-btn').onclick=()=>showPage('start-page');

// STREAM
function selectStream(stream,btn){
  selectedStream=stream;
  activate(btn);
  loadDepartments();
  showPage('department-page');
}

// DEPARTMENTS
function loadDepartments(){
  const div=document.getElementById('departments');
  div.innerHTML='';
  ['cse','ece','eee'].forEach(dep=>{
    const b=document.createElement('button');
    b.textContent=dep.toUpperCase();
    b.onclick=()=>selectDepartment(dep,b);
    div.appendChild(b);
  });
}

function selectDepartment(dep,btn){
  selectedDepartment=dep;
  activate(btn);
  loadSemesters();
  showPage('semester-page');
}

// SEMESTERS
function loadSemesters(){
  const div=document.getElementById('semesters');
  div.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.textContent='Semester '+i;
    b.onclick=()=>selectSemester(i,b);
    div.appendChild(b);
  }
}

function selectSemester(sem,btn){
  selectedSemester=sem;
  activate(btn);
  loadSubjects();
}

// SUBJECTS
async function loadSubjects(){
  subjectsList.innerHTML='';
  grades={};

  const res=await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
  const data=await res.json();

  data.subjects.forEach(sub=>{
    const div=document.createElement('div');
    div.className='subject';
    div.innerHTML=`
      <strong>${sub.code} - ${sub.name} (${sub.credits} cr)</strong>
      <div class="grade-buttons">
        ${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`).join('')}
      </div>
    `;
    subjectsList.appendChild(div);
  });

  showPage('subjects-page');
}

function selectGrade(code,grade,btn){
  grades[code]=grade;
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}

function activate(btn){
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// CALCULATE
document.getElementById('calculate-btn').onclick=()=>{
  let total=0,credits=0;

  document.querySelectorAll('.subject').forEach(s=>{
    const code=s.textContent.split('-')[0].trim();
    const cr=parseFloat(s.textContent.match(/\((.*?) cr\)/)[1]);
    total+=gradePoints[grades[code]]*cr;
    credits+=cr;
  });

  const gpa=(total/credits).toFixed(2);
  document.getElementById('gpa').textContent='GPA: '+gpa;
  document.getElementById('cgpa').textContent='CGPA: '+gpa;
  document.getElementById('percentage').textContent='Percentage: '+(gpa*9.5).toFixed(2)+'%';
};