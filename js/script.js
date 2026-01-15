const pages=document.querySelectorAll('.page');
const startBtn=document.getElementById('start-btn');
const streamsDiv=document.getElementById('streams');
const departmentsDiv=document.getElementById('departments');
const semestersDiv=document.getElementById('semesters');
const subjectsList=document.getElementById('subjects-list');
const calculateBtn=document.getElementById('calculate-btn');
const editBtn=document.getElementById('edit-btn');
const deleteBtn=document.getElementById('delete-btn');
const gpaDisplay=document.getElementById('gpa-display');
const cgpaDisplay=document.getElementById('cgpa-display');
const percentageDisplay=document.getElementById('percentage-display');
const encouragementDisplay=document.getElementById('encouragement');

const homeIcon=document.getElementById('home-icon');
const graphIcon=document.getElementById('graph-icon');
const faqIcon=document.getElementById('faq-icon');
const saveIcon=document.getElementById('floating-save-btn');

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const encouragements=[{min:9,msg:"Excellent work! Keep it up!"},{min:8,msg:"Very good! You can reach the top!"},{min:7,msg:"Good! Focus on improving slightly."},{min:5,msg:"Average. Need more effort."},{min:0,msg:"Work harder! You can improve!"}];

let selectedStream='', selectedDepartment='', selectedSemester=0;
let subjects=[], grades={}, semesterGPAs=JSON.parse(localStorage.getItem('semesterGPAs'))||[];

function showPage(id){ pages.forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }

// Navigation
startBtn.onclick=()=>showPage('stream-page');
homeIcon.onclick=()=>showPage('start-page');
graphIcon.onclick=()=>showPage('subjects-page');
faqIcon.onclick=()=>showPage('faq-page');
saveIcon.onclick=()=>showPage('saved-page');

// Stream
document.querySelectorAll('.stream-btn').forEach(btn=>{ btn.onclick=()=>{
  selectedStream=btn.dataset.stream; showDepartments(); showPage('department-page');
}; });

const departments={engineering:["CSE","ISE","ECE","EEE","AA"],bcom:["BCOM"]};
function showDepartments(){ departmentsDiv.innerHTML=''; departments[selectedStream].forEach(dep=>{
  const b=document.createElement('button'); b.textContent=dep; b.onclick=()=>{
    selectedDepartment=dep.toLowerCase(); showSemesters(); showPage('semester-page');
  }; departmentsDiv.appendChild(b);
}); }

function showSemesters(){ semestersDiv.innerHTML=''; for(let i=1;i<=8;i++){
  const b=document.createElement('button'); b.textContent='Semester '+i; b.onclick=()=>{
    selectedSemester=i; loadSubjects(); showPage('subjects-page');
  }; semestersDiv.appendChild(b);
} }

async function loadSubjects(){
  subjectsList.innerHTML=''; grades={};
  try{
    const res=await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
    const data=await res.json(); subjects=data.subjects;
    subjects.forEach(s=>{
      const div=document.createElement('div'); div.className='subject';
      div.innerHTML=`<span>${s.code} - ${s.name} (${s.credits}cr)</span>`;
      const gradeDiv=document.createElement('div'); gradeDiv.className='grade-buttons';
      ["S","A","B","C","D","E","F"].forEach(g=>{
        const btn=document.createElement('button'); btn.textContent=g;
        btn.onclick=()=>{ grades[s.code]=g; Array.from(gradeDiv.children).forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); };
        gradeDiv.appendChild(btn);
      });
      div.appendChild(gradeDiv); subjectsList.appendChild(div);
    });
    // Load saved grades
    const saved=JSON.parse(localStorage.getItem(`${selectedDepartment}_sem${selectedSemester}`))||{};
    Object.keys(saved).forEach(code=>{
      const subDiv = Array.from(subjectsList.querySelectorAll('.subject')).find(d=>d.textContent.includes(code));
      if(subDiv){
        const btn = Array.from(subDiv.querySelectorAll('button')).find(b=>b.textContent===saved[code]);
        if(btn){ btn.classList.add('selected'); grades[code]=saved[code]; }
      }
    });
  }catch(e){ subjectsList.innerHTML="<p>Subjects not found!</p>"; }
}

// Calculate GPA & CGPA
calculateBtn.onclick=function(){
  if(Object.keys(grades).length!==subjects.length){ alert("Select all grades."); return; }
  let total=0,creditsSum=0;
  subjects.forEach(s=>{ total+=gradePoints[grades[s.code]]*s.credits; creditsSum+=s.credits; });
  const gpa=(total/creditsSum).toFixed(2);
  gpaDisplay.textContent='GPA: '+gpa;
  localStorage.setItem(`${selectedDepartment}_sem${selectedSemester}`,JSON.stringify(grades));
  semesterGPAs[selectedSemester-1]=parseFloat(gpa);
  localStorage.setItem('semesterGPAs',JSON.stringify(semesterGPAs));
  const cgpa=(semesterGPAs.filter(Boolean).reduce((a,b)=>a+b,0)/semesterGPAs.filter(Boolean).length).toFixed(2);
  cgpaDisplay.textContent='CGPA: '+cgpa;
  percentageDisplay.textContent='Percentage: '+(cgpa*9.5).toFixed(2)+'%';
  for(const e of encouragements){ if(cgpa>=e.min){ encouragementDisplay.textContent=e.msg; break; } }
  updateChart();
};

// Chart
const ctx=document.getElementById('gpaChart').getContext('2d');
const gpaChart=new Chart(ctx,{
  type:'line',
  data:{ labels:['Sem1','Sem2','Sem3','Sem4','Sem5','Sem6','Sem7','Sem8'], datasets:[{ label:'Semester GPA', data:semesterGPAs, borderColor:'rgba(106,17,203,1)', backgroundColor:'rgba(37,117,252,0.3)', fill:true, tension:0.3 }] },
  options:{ responsive:true, scales:{ y:{ min:0,max:10 } } }
});
function updateChart(){ gpaChart.data.datasets[0].data=semesterGPAs; gpaChart.update(); }

// FAQ toggle
document.querySelectorAll('.faq-question').forEach(btn=>{ btn.onclick=()=>{ const ans=btn.nextElementSibling; ans.style.display=ans.style.display==='block'?'none':'block'; }; });

// Reset semesters
document.getElementById('reset-semesters').onclick=()=>{
  localStorage.clear(); semesterGPAs=[]; updateChart(); showPage('start-page'); alert('All semesters reset!');
};