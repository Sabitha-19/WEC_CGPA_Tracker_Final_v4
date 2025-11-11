function goBack(target) {
  showTab(target);
}
const DEPARTMENTS = ['ISE','CSE','ECE','EEE','AA'];
let state = { dept:null, sem:null, subjects:[], saved:{} };

const startBtn = document.getElementById('startBtn');
const deptList = document.getElementById('deptList');
const semList = document.getElementById('semList');
const subjectsEl = document.getElementById('subjects');
const feedback = document.getElementById('feedback');
const totalCreditsEl = document.getElementById('totalCredits');
const gpaEl = document.getElementById('gpa');
const cgpaEl = document.getElementById('cgpa');
const savedList = document.getElementById('savedList');

function showTab(id){
  document.querySelectorAll('.tab').forEach(s=> s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

startBtn.onclick = ()=> showTab('dept');

DEPARTMENTS.forEach(d=>{
  const btn = document.createElement('div');
  btn.className='dept-btn';
  btn.textContent=d;
  btn.onclick=()=>{
    state.dept=d;
    buildSemButtons();
    showTab('sem');
  };
  deptList.appendChild(btn);
});

function buildSemButtons(){
  semList.innerHTML='';
  for(let i=1;i<=8;i++){
    const b=document.createElement('div');
    b.className='sem-btn';
    b.textContent='Semester '+i;
    b.onclick=()=>{state.sem=i; loadSyllabus();};
    semList.appendChild(b);
  }
}

async function loadSyllabus(){
  feedback.textContent='Loading syllabus...';
  const path=`data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
  try{
    const res=await fetch(path);
    if(!res.ok) throw new Error('Missing file');
    const json=await res.json();
    state.subjects=json.subjects||[];
    renderSubjects();
    showTab('calc');
  }catch(e){
    feedback.textContent='Syllabus not found.';
  }
}

function renderSubjects(){
  subjectsEl.innerHTML='';
  state.subjects.forEach((s,idx)=>{
    const box=document.createElement('div');
    box.className='subject';
    box.innerHTML=`
      <div style="display:flex;justify-content:space-between">
        <strong>${s.code}</strong>
        <span>${s.credits} credits</span>
      </div>
      <div>${s.name}</div>
      <div class="grade-grid">
        ${['S','A','B','C','D','E','F'].map(g=>`<div class="grade-cell" data-g="${g}">${g}</div>`).join('')}
      </div>`;
    subjectsEl.appendChild(box);
    box.querySelectorAll('.grade-cell').forEach(c=>{
      c.onclick=()=>{
        box.querySelectorAll('.grade-cell').forEach(x=>x.classList.remove('active'));
        c.classList.add('active');
        s.selected=c.dataset.g;
      };
    });
  });
}

function gradeToPoint(g){
  return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g]||0;
}

document.getElementById('calculate').onclick=function(){
  let tot=0,wt=0;
  for(const s of state.subjects){
    if(!s.selected){feedback.textContent='Select all grades.';return;}
    tot+=Number(s.credits); wt+=gradeToPoint(s.selected)*Number(s.credits);
  }
  const gpa=tot?wt/tot:0;
  totalCreditsEl.textContent=tot;
  gpaEl.textContent=gpa.toFixed(2);

  let msg="";
  if(gpa>=9) msg="🌟 Outstanding! Keep shining!";
  else if(gpa>=8) msg="💪 Excellent work!";
  else if(gpa>=7) msg="👍 Good job!";
  else if(gpa>=6) msg="😊 Nice effort!";
  else if(gpa>=5) msg="📘 Keep improving!";
  else msg="🔥 Don’t be discouraged!";
  feedback.textContent=msg;
};

document.getElementById('save').onclick = function() {
  if (!state.dept || !state.sem) {
    feedback.textContent = "Select department and semester before saving.";
    return;
  }
  const gpa = parseFloat(gpaEl.textContent);
  if (isNaN(gpa) || gpa === 0) {
    feedback.textContent = "Please calculate GPA before saving.";
    return;
  }

  // Save GPA to localStorage
  state.saved[`${state.dept}_sem${state.sem}`] = gpa;
  localStorage.setItem("wec_saved", JSON.stringify(state.saved));

  // Re-render saved semesters + CGPA
  renderSaved();
  feedback.textContent = "✅ Semester saved successfully!";
  showTab("saved");
};


function renderSaved() {
  const data = state.saved;
  savedList.innerHTML = '';
  let total = 0, count = 0;

  for (const [key, val] of Object.entries(data)) {
    const li = document.createElement('li');
    li.textContent = `${key.toUpperCase()}: GPA ${val.toFixed(2)}`;
    savedList.appendChild(li);
    total += val;
    count++;
  }

  const cgpa = count ? (total / count).toFixed(2) : '0.00';
  cgpaEl.textContent = cgpa;
}
