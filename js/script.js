// ===== GLOBAL STATE =====
let selectedStream = '';
let selectedDepartment = '';
let selectedSemester = 0;
let grades = {};

const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};

// ===== PAGE NAVIGATION =====
const pages = ['start-page','stream-page','department-page','semester-page','subjects-page','faq-page','graph-page'];

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== HEADER ICONS =====
document.getElementById('home-icon').onclick = () => showPage('start-page');
document.getElementById('graph-icon').onclick = () => showGraphPage();
document.getElementById('print-icon').onclick = () => window.print();
document.getElementById('back-btn').onclick = () => {
  let current = document.querySelector('.page.active').id;
  let idx = pages.indexOf(current);
  if(idx>0) showPage(pages[idx-1]);
};

// ===== STREAM =====
function selectStream(stream,btn){
  selectedStream=stream;
  activate(btn);
  loadDepartments();
  showPage('department-page');
}

// ===== DEPARTMENTS =====
function loadDepartments(){
  const d=document.getElementById('departments');
  d.innerHTML='';
  ['cse','ece','eee'].forEach(dep=>{
    const b=document.createElement('button');
    b.textContent=dep.toUpperCase();
    b.onclick=()=>{
      selectedDepartment=dep;
      activate(b);
      loadSemesters();
      showPage('semester-page');
    };
    d.appendChild(b);
  });
}

// ===== SEMESTERS =====
function loadSemesters(){
  const s=document.getElementById('semesters');
  s.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.textContent=`Semester ${i}`;
    b.onclick=()=>{
      selectedSemester=i;
      activate(b);
      loadSubjects();
    };
    s.appendChild(b);
  }
}

// ===== SUBJECTS =====
async function loadSubjects(){
  const list=document.getElementById('subjects-list');
  list.innerHTML='';
  grades={};
  try{
    const res=await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data=await res.json();
    data.subjects.forEach(sub=>{
      const div=document.createElement('div');
      div.className='subject';
      div.dataset.code=sub.code;
      div.dataset.credits=sub.credits;
      div.innerHTML=`
        <strong>${sub.code} - ${sub.name} (${sub.credits} cr)</strong>
        <div class="grade-buttons">
          ${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${sub.code}','${g}',this)">${g}</button>`).join('')}
        </div>
      `;
      list.appendChild(div);
    });
    showPage('subjects-page');
  }catch(err){
    alert('Subject data not found!');
    showPage('semester-page');
  }
}

// ===== GRADE SELECTION =====
function selectGrade(code,grade,btn){
  grades[code]=grade;
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ===== BUTTON ACTIVE =====
function activate(btn){
  btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== CALCULATION =====
document.getElementById('calculate-btn').onclick=()=>{
  let totalPoints=0,totalCredits=0;
  const subjects=document.querySelectorAll('.subject');
  for(let s of subjects){
    const code=s.dataset.code;
    const credits=parseFloat(s.dataset.credits);
    if(!grades[code]){ alert('Please select all grades!'); return;}
    totalPoints+=gradePoints[grades[code]]*credits;
    totalCredits+=credits;
  }
  const gpa=(totalPoints/totalCredits).toFixed(2);
  const percentage=(gpa*9.5).toFixed(2);

  document.getElementById('gpa').textContent=`GPA: ${gpa}`;
  document.getElementById('cgpa').textContent=`CGPA: ${gpa}`;
  document.getElementById('percentage').textContent=`Percentage: ${percentage}%`;

  saveSemesterGPA(selectedDepartment,selectedSemester,parseFloat(gpa));
};

// ===== SAVE SEMESTER GPA =====
function saveSemesterGPA(dep,sem,gpa){
  const key=`${dep}_sem${sem}`;
  localStorage.setItem(key,gpa);
}

// ===== GRAPH PAGE =====
function showGraphPage(){
  showPage('graph-page');
  if(!document.getElementById('cgpaChart')){
    const canvas=document.createElement('canvas');
    canvas.id='cgpaChart';
    canvas.height=200;
    document.getElementById('graph-page').appendChild(canvas);
  }

  const saved=[];
  for(let i=1;i<=8;i++){
    const key=`${selectedDepartment}_sem${i}`;
    const g=localStorage.getItem(key);
    saved.push(g?parseFloat(g):0);
  }

  const ctx=document.getElementById('cgpaChart').getContext('2d');
  if(window.cgpaChart) window.cgpaChart.destroy();

  window.cgpaChart=new Chart(ctx,{
    type:'line',
    data:{
      labels:Array.from({length:8},(_,i)=>`Sem ${i+1}`),
      datasets:[{
        label:`${selectedDepartment.toUpperCase()} CGPA`,
        data:saved,
        backgroundColor:'rgba(74,58,255,0.2)',
        borderColor:'#4a3aff',
        borderWidth:2,
        tension:0.3,
        fill:true
      }]
    },
    options:{
      scales:{y:{min:0,max:10,ticks:{stepSize:1}}}
    }
  });
}