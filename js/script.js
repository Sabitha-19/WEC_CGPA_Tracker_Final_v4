const pages = document.querySelectorAll('.page');
const startBtn = document.getElementById('start-btn');
const streamButtonsDiv = document.getElementById('stream-buttons');
const semButtonsDiv = document.getElementById('sem-buttons');
const subjectsList = document.getElementById('subjects-list');
const gpaResult = document.getElementById('gpa-result');

const backFromStream = document.getElementById('back-from-stream');
const backFromSelection = document.getElementById('back-from-selection');
const backFromSubjects = document.getElementById('back-from-subjects');
const homeBtn = document.getElementById('home-btn');
const chartBtn = document.getElementById('chart-btn');

const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };
let selectedStream=null, selectedSem=null, subjectsData=[];

// Navigation
function showPage(id){ pages.forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); }
startBtn.onclick = ()=>{ showPage('stream-page'); loadStreams(); }
backFromStream.onclick = ()=>showPage('start-page');
backFromSelection.onclick = ()=>showPage('stream-page');
backFromSubjects.onclick = ()=>showPage('selection-page');
homeBtn.onclick = ()=>showPage('start-page');
chartBtn.onclick = ()=>showPage('subjects-page');

// Streams
const streams = ['Engineering','B.Com'];
function loadStreams(){
  streamButtonsDiv.innerHTML='';
  streams.forEach(s=>{
    let btn=document.createElement('button');
    btn.textContent=s;
    btn.onclick=()=>{ selectedStream=s; loadSemesters(); }
    streamButtonsDiv.appendChild(btn);
  });
}

// Semesters
function loadSemesters(){
  semButtonsDiv.innerHTML='';
  for(let i=1;i<=8;i++){
    let btn=document.createElement('button');
    btn.textContent='Semester '+i;
    btn.onclick=()=>{ selectedSem=i; loadSubjects(); }
    semButtonsDiv.appendChild(btn);
  }
  showPage('selection-page');
}

// Subjects JSON load
async function loadSubjects(){
  const response = await fetch(`data/${selectedStream.toLowerCase()}_sem${selectedSem}.json`);
  subjectsData = await response.json();
  displaySubjects();
}

// Display Subjects
function displaySubjects(){
  subjectsList.innerHTML='';
  subjectsData.subjects.forEach((sub, idx)=>{
    let div=document.createElement('div'); div.className='subject';
    div.innerHTML=`<span>${sub.code} - ${sub.name} (${sub.credits}cr)</span>`;
    let gradeDiv=document.createElement('div'); gradeDiv.className='grade-buttons';
    ['S','A','B','C','D','E','F'].forEach(g=>{
      let btn=document.createElement('button'); btn.textContent=g;
      btn.onclick=()=>{ gradeDiv.querySelectorAll('button').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }
      gradeDiv.appendChild(btn);
    });
    div.appendChild(gradeDiv); subjectsList.appendChild(div);
  });
  showPage('subjects-page');
}

// Calculate GPA
document.getElementById('calculate-gpa').onclick=()=>{
  let totalPts=0,totalCr=0;
  subjectsData.subjects.forEach((sub, idx)=>{
    const grade=subjectsList.children[idx].querySelector('.grade-buttons button.selected')?.textContent;
    if(!grade) return;
    totalPts += gradePoints[grade]*sub.credits;
    totalCr += sub.credits;
  });
  const gpa=(totalPts/totalCr).toFixed(2);
  gpaResult.textContent=`GPA: ${gpa}`;
  saveGPA(selectedStream,selectedSem,gpa);
  drawChart();
}

// Save GPA to localStorage
function saveGPA(stream,sem,gpa){
  let data=JSON.parse(localStorage.getItem('cgpa_data')||'{}');
  data[`${stream}_sem${sem}`]=parseFloat(gpa);
  localStorage.setItem('cgpa_data',JSON.stringify(data));
}

// Chart
function drawChart(){
  const ctx=document.getElementById('cgpa-chart').getContext('2d');
  let data=JSON.parse(localStorage.getItem('cgpa_data')||'{}');
  const labels=Object.keys(data);
  const values=Object.values(data);
  if(window.cgpaChart) window.cgpaChart.destroy();
  window.cgpaChart=new Chart(ctx,{
    type:'line',
    data:{ labels, datasets:[{label:'Semester GPA', data:values, borderColor:'#5c33f6', backgroundColor:'rgba(92,51,246,0.2)', tension:0.2, fill:true}] },
    options:{ scales:{ y:{ beginAtZero:true, max:10 } } }
  });
}