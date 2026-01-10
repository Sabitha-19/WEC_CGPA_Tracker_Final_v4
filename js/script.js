let state = {
  stream: "",
  dept: "",
  sem: "",
  history: [],
  saved: []
};

const grades = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectStream(s) {
  state.stream = s;
  loadDepartments();
  showSection('department');
}

function loadDepartments() {
  const depts = ['CSE','ISE','ECE','EEE','AA'];
  const d = document.getElementById('deptButtons');
  d.innerHTML = '';
  depts.forEach(dep=>{
    const b = document.createElement('button');
    b.innerText = dep;
    b.onclick = ()=>{state.dept=dep;loadSem();};
    d.appendChild(b);
  });
}

function loadSem() {
  const max = state.stream === 'Engineering' ? 8 : 6;
  const s = document.getElementById('semButtons');
  s.innerHTML='';
  for(let i=1;i<=max;i++){
    const b=document.createElement('button');
    b.innerText='Semester '+i;
    b.onclick=()=>{state.sem=i;loadSubjects();};
    s.appendChild(b);
  }
  showSection('semester');
}

function loadSubjects() {
  const list = document.getElementById('subjects');
  list.innerHTML='';
  for(let i=1;i<=5;i++){
    const div=document.createElement('div');
    div.className='subject';
    div.innerHTML=`Subject ${i}
      <select>
        ${Object.keys(grades).map(g=>`<option>${g}</option>`).join('')}
      </select>`;
    list.appendChild(div);
  }
  showSection('grades');
}

function calculateGPA() {
  let total=0;
  document.querySelectorAll('select').forEach(s=>total+=grades[s.value]);
  const gpa=(total/5).toFixed(2);
  document.getElementById('gpa').innerText=gpa;
  showSection('result');
}

function saveSemester() {
  state.saved.push(parseFloat(document.getElementById('gpa').innerText));
  alert('Semester saved!');
}

function convert() {
  const v=document.getElementById('cgpaInput').value;
  document.getElementById('percent').innerText=(v*10).toFixed(1)+'%';
}

let chart;
function drawChart() {
  const ctx=document.getElementById('chart');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'line',
    data:{
      labels: state.saved.map((_,i)=>'Sem '+(i+1)),
      datasets:[{
        data: state.saved,
        borderColor:'#5a4fcf',
        tension:.3
      }]
    }
  });
}

document.getElementById('graph').addEventListener('click',drawChart);