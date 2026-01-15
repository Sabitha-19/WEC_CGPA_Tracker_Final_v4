const pages=document.querySelectorAll('.page');
const startBtn=document.getElementById('start-btn');
const departmentsDiv=document.getElementById('departments');
const semestersDiv=document.getElementById('semesters');
const subjectsList=document.getElementById('subjects-list');

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

let selectedStream='',selectedDepartment='',selectedSemester=0;
let subjects=[],grades={};
let semesterGPAs=JSON.parse(localStorage.getItem('semesterGPAs'))||[];

function showPage(id){
  pages.forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

startBtn.onclick=()=>showPage('stream-page');

document.querySelectorAll('.stream-btn').forEach(btn=>{
  btn.onclick=()=>{
    selectedStream=btn.dataset.stream;
    loadDepartments();
    showPage('department-page');
  };
});

const departments={
  engineering:["cse","ise","ece","eee","aa"],
  bcom:["bcom"]
};

function loadDepartments(){
  departmentsDiv.innerHTML='';
  departments[selectedStream].forEach(dep=>{
    const b=document.createElement('button');
    b.textContent=dep.toUpperCase();
    b.onclick=()=>{
      selectedDepartment=dep;
      loadSemesters();
      showPage('semester-page');
    };
    departmentsDiv.appendChild(b);
  });
}

function loadSemesters(){
  semestersDiv.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('button');
    b.textContent='Semester '+i;
    b.onclick=()=>{
      selectedSemester=i;
      loadSubjects();
      showPage('subjects-page');
    };
    semestersDiv.appendChild(b);
  }
}

async function loadSubjects(){
  subjectsList.innerHTML='';
  grades={};
  const res=await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
  const data=await res.json();
  subjects=data.subjects;

  subjects.forEach(s=>{
    const div=document.createElement('div');
    div.className='subject';
    div.innerHTML=`<b>${s.code}</b> - ${s.name}`;
    const gdiv=document.createElement('div');
    gdiv.className='grade-buttons';
    ["S","A","B","C","D","E","F"].forEach(g=>{
      const btn=document.createElement('button');
      btn.textContent=g;
      btn.onclick=()=>{
        grades[s.code]=g;
        [...gdiv.children].forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      gdiv.appendChild(btn);
    });
    div.appendChild(gdiv);
    subjectsList.appendChild(div);
  });
}

const ctx=document.getElementById('gpaChart').getContext('2d');
new Chart(ctx,{
  type:'line',
  data:{
    labels:['S1','S2','S3','S4','S5','S6','S7','S8'],
    datasets:[{
      data:semesterGPAs,
      borderColor:'#6a11cb',
      backgroundColor:'rgba(106,17,203,0.3)',
      fill:true
    }]
  },
  options:{scales:{y:{min:0,max:10}}}
});