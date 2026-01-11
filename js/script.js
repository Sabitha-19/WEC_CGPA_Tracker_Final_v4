let state={
  stream:"",
  dept:"",
  sem:"",
  saved:[]
};

const gradeMap={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function selectStream(s){
  state.stream=s;
  loadDepartments();
  showSection('department');
}

function loadDepartments(){
  const depts=['cse','ise','ece','eee','aa'];
  const box=document.getElementById('deptButtons');
  box.innerHTML='';
  depts.forEach(d=>{
    const b=document.createElement('button');
    b.textContent=d.toUpperCase();
    b.onclick=()=>{state.dept=d;loadSemesters()};
    box.appendChild(b);
  });
}

function loadSemesters(){
  const max=state.stream==='engineering'?8:6;
  const box=document.getElementById('semButtons');
  box.innerHTML='';
  for(let i=1;i<=max;i++){
    const b=document.createElement('button');
    b.textContent='Semester '+i;
    b.onclick=()=>{state.sem=i;loadSubjects()};
    box.appendChild(b);
  }
  showSection('semester');
}

async function loadSubjects(){
  const file=`data/${state.stream==='bcom'?'bcom':state.dept}_sem${state.sem}.json`;
  const res=await fetch(file);
  const subjects=await res.json();

  const box=document.getElementById('subjects');
  box.innerHTML='';

  subjects.forEach(sub=>{
    const div=document.createElement('div');
    div.className='subject';
    div.innerHTML=`
      <span>${sub.name}</span>
      <select>
        ${Object.keys(gradeMap).map(g=>`<option>${g}</option>`).join('')}
      </select>`;
    box.appendChild(div);
  });

  showSection('grades');
}

function calculateGPA(){
  let total=0,count=0;
  document.querySelectorAll('select').forEach(s=>{
    total+=gradeMap[s.value];
    count++;
  });
  const gpa=(total/count).toFixed(2);
  document.getElementById('gpa').innerText=gpa;
  showSection('result');
}

function saveSemester(){
  state.saved.push(parseFloat(document.getElementById('gpa').innerText));
  alert('Semester saved!');
}

let chart;
function drawChart(){
  showSection('graphSection');
  const ctx=document.getElementById('chart');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'line',
    data:{
      labels:state.saved.map((_,i)=>`Sem ${i+1}`),
      datasets:[{
        data:state.saved,
        borderColor:'#5a4fcf',
        tension:.3
      }]
    }
  });
}