const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
const departments = { engineering:["CSE","ISE","ECE","EEE","AA"], bcom:["BCOM"] };
let state={ stream:null, dept:null, sem:null, grades:{}, gpaHistory:Array(8).fill(null) };
let chart;

document.getElementById('continueBtn').onclick = ()=>show('stream');

function show(id){ document.querySelectorAll('section').forEach(s=>s.classList.remove('active')); document.getElementById(id).classList.add('active'); }

function selectStream(s){
  state.stream=s;
  const d=document.getElementById('deptList'); d.innerHTML='';
  departments[s].forEach(dep=>{
    const btn=document.createElement('button'); btn.textContent=dep;
    btn.onclick=()=>selectDept(dep); d.appendChild(btn);
  });
  show('department');
}

function selectDept(dep){
  state.dept=dep;
  const s=document.getElementById('semList'); s.innerHTML='';
  for(let i=1;i<=8;i++){
    const btn=document.createElement('button');
    btn.textContent=`Semester ${i}`;
    btn.onclick=()=>selectSem(i);
    s.appendChild(btn);
  }
  show('semester');
}

async function selectSem(sem){
  state.sem=sem; state.grades={};
  const list=document.getElementById('subjectList'); list.innerHTML='';
  document.getElementById('semTitle').innerText=`Semester ${sem}`;
  const fileName = `data/${state.dept.toLowerCase()}_sem${sem}.json`;
  try {
    const res = await fetch(fileName);
    if(!res.ok) throw new Error('File not found');
    const subjects = await res.json();
    subjects.forEach((sub,i)=>{
      const card=document.createElement('div'); card.className='card';
      card.innerHTML=`${sub.name} (${sub.credits} credits)
        <select onchange="state.grades[${i}]=gradePoints[this.value]">
          <option value="">Grade</option>
          ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join('')}
        </select>`;
      list.appendChild(card);
    });
    show('subjects');
  } catch(err){
    alert('Subjects file not found for this semester.');
  }
}

function calculateGPA(){
  const cards=document.querySelectorAll('#subjectList .card');
  if(cards.length===0) return alert('No subjects loaded!');
  let total=0, credits=0;
  for(let i=0;i<cards.length;i++){
    if(state.grades[i]==null) return alert('Select all grades!');
    const cr = Number(cards[i].textContent.match(/\((\d+) credits\)/)[1]);
    total += state.grades[i]*cr; credits+=cr;
  }
  const gpa=(total/credits).toFixed(2); state.gpaHistory[state.sem-1]=Number(gpa);
  document.getElementById('gpa').innerText=gpa;
  const cgpa=calcCGPA();
  document.getElementById('cgpa').innerText=cgpa;
  document.getElementById('percentage').innerText=(cgpa*9.5).toFixed(2)+'%';
  drawChart();
  show('result');
  loadSavedSemesters();
}

// CGPA Calculation
function calcCGPA(){
  const v=state.gpaHistory.filter(x=>x!=null);
  return (v.reduce((a,b)=>a+b,0)/v.length).toFixed(2);
}

// Chart
function drawChart(){
  if(chart) chart.destroy();
  chart=new Chart(document.getElementById('chart'),{
    type:'line',
    data:{
      labels:state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
      datasets:[{ label:'GPA', data:state.gpaHistory, borderColor:'#7c3aed', backgroundColor:'rgba(124,58,237,0.2)', borderWidth:3, fill:true, tension:0.3 }]
    },
    options:{ responsive:true, scales:{ y:{ min:0,max:10 } } }
  });
}

// Local Storage: Save Semester
function saveSemester(){
  const key = `${state.dept}_sem${state.sem}`;
  const saved = JSON.parse(localStorage.getItem('savedSemesters')||'{}');
  saved[key] = { grades: {...state.grades}, gpa: state.gpaHistory[state.sem-1] };
  localStorage.setItem('savedSemesters', JSON.stringify(saved));
  alert('Semester saved!');
  loadSavedSemesters();
}

// Load Saved Semesters
function loadSavedSemesters(){
  const savedList=document.getElementById('savedList');
  if(!savedList) return;
  savedList.innerHTML='';
  const saved = JSON.parse(localStorage.getItem('savedSemesters')||'{}');
  Object.keys(saved).forEach(key=>{
    const div=document.createElement('div');
    div.innerHTML=`${key}: GPA ${saved[key].gpa} 
      <button onclick="editSemester('${key}')">Edit</button> 
      <button onclick="deleteSemester('${key}')">Delete</button>`;
    savedList.appendChild(div);
  });
  show('savedSemesters');
}

// Edit Semester
function editSemester(key){
  const saved = JSON.parse(localStorage.getItem('savedSemesters')||'{}');
  const [dept,semStr] = key.split('_sem');
  state.dept = dept; state.sem = Number(semStr); state.grades = saved[key].grades;
  selectSem(state.sem);
}

// Delete Semester
function deleteSemester(key){
  const saved = JSON.parse(localStorage.getItem('savedSemesters')||'{}');
  delete saved[key];
  localStorage.setItem('savedSemesters', JSON.stringify(saved));
  loadSavedSemesters();
}