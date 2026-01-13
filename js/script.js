let selectedDepartment='', selectedSemester=0, grades={};

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('home-icon').onclick=()=>showPage('start-page');
document.getElementById('faq-icon').onclick=()=>showPage('faq-page');
document.getElementById('back-btn').onclick=()=>showPage('start-page');

function selectStream(_,btn){
  activate(btn);
  loadDepartments();
  showPage('department-page');
}

function loadDepartments(){
  const d=document.getElementById('departments');
  d.innerHTML='';
  ['cse','ece','eee'].forEach(dep=>{
    const b=document.createElement('button');
    b.textContent=dep.toUpperCase();
    b.onclick=()=>{selectedDepartment=dep;activate(b);loadSemesters();showPage('semester-page')};
    d.appendChild(b);
  });
}

function loadSemesters(){
  const s=document.getElementById('semesters');
  s.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.textContent='Semester '+i;
    b.onclick=()=>{selectedSemester=i;activate(b);loadSubjects()};
    s.appendChild(b);
  }
}

async function loadSubjects(){
  const list=document.getElementById('subjects-list');
  list.innerHTML='';
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
      </div>`;
    list.appendChild(div);
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

// ===== HEADER ICON ACTIONS =====

// Home → Go to Welcome page
document.getElementById('home-icon').onclick = () => {
  showPage('start-page');
};

// Graph → Go to Subjects / Graph page
document.getElementById('graph-icon').onclick = () => {
  showPage('subjects-page');
};

// Print → Print GPA/CGPA result
document.getElementById('print-icon').onclick = () => {
  window.print();
};