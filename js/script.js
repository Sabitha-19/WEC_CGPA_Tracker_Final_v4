const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

const departments = {
  engineering: ["CSE","ISE","ECE","EEE","ME"],
  bcom: ["BCOM"]
};

let selectedStream = "";
let selectedDept = "";
let selectedSem = "";
let semGPAs = [];

function goTo(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectStream(stream){
  selectedStream = stream;
  const list = document.getElementById("deptList");
  list.innerHTML = "";
  departments[stream].forEach(d=>{
    list.innerHTML += `<div class="card" onclick="selectDept('${d}')">${d}</div>`;
  });
  goTo("page-dept");
}

function selectDept(dept){
  selectedDept = dept;
  const semList = document.getElementById("semList");
  semList.innerHTML = "";
  for(let i=1;i<=8;i++){
    semList.innerHTML += `<div class="card" onclick="selectSem(${i})">Semester ${i}</div>`;
  }
  goTo("page-sem");
}

function selectSem(sem){
  selectedSem = sem;
  const list = document.getElementById("subjectList");
  list.innerHTML = "";

  // SAMPLE SUBJECTS (replace with your real data)
  const subjects = [
    {name:"Subject 1", credits:4},
    {name:"Subject 2", credits:3},
    {name:"Subject 3", credits:3}
  ];

  subjects.forEach((s,i)=>{
    list.innerHTML += `
      <div class="card">
        <b>${s.name}</b> (${s.credits} credits)
        <select id="g${i}">
          ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join("")}
        </select>
      </div>`;
  });

  goTo("page-grades");
}

function calculateGPA(){
  let total = 0, credits = 0;
  document.querySelectorAll("select").forEach(sel=>{
    total += gradePoints[sel.value] * 3;
    credits += 3;
  });

  const gpa = (total/credits).toFixed(2);
  semGPAs.push(gpa);

  const cgpa = (semGPAs.reduce((a,b)=>a+Number(b),0)/semGPAs.length).toFixed(2);
  const percent = (cgpa*9.5).toFixed(2);

  document.getElementById("gpaText").innerText = `Semester GPA: ${gpa}`;
  document.getElementById("cgpaText").innerText = `CGPA: ${cgpa}`;
  document.getElementById("percentText").innerText = `Percentage: ${percent}%`;

  drawChart();
  goTo("page-result");
}

function drawChart(){
  new Chart(document.getElementById("gpaChart"),{
    type:'line',
    data:{
      labels: semGPAs.map((_,i)=>`Sem ${i+1}`),
      datasets:[{
        label:'GPA',
        data:semGPAs,
        borderColor:'#6f3bd2',
        tension:0.4
      }]
    }
  });
}