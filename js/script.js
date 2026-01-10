const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

const departments = {
  engineering: ["CSE","ISE","ECE","EEE","AA"],
  bcom: ["BCOM"]
};

// ⬇️ USE YOUR FULL SUBJECT DATA HERE
const subjectsData = {
  engineering:{
    1:[{name:"Maths",credits:4},{name:"Physics",credits:3}],
    2:[{name:"DS",credits:4},{name:"OOPS",credits:3}],
    3:[],4:[],5:[],6:[],7:[],8:[]
  },
  bcom:{
    1:[{name:"Financial Accounting",credits:4}],
    2:[{name:"Business Economics",credits:4}],
    3:[],4:[],5:[],6:[]
  },
  aa:{
    5:[{name:"Architecture Design",credits:4}],
    6:[],7:[],8:[]
  }
};

let state = {
  stream:null,
  dept:null,
  sem:null,
  grades:{},
  gpaHistory:Array(8).fill(null)
};

let chart;

function showSection(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

window.onload = ()=>{
  const list = document.getElementById("streamList");
  Object.keys(departments).forEach(s=>{
    const btn = document.createElement("button");
    btn.className="btn primary";
    btn.textContent = s.toUpperCase();
    btn.onclick = ()=>selectStream(s);
    list.appendChild(btn);
  });
};

function selectStream(stream){
  state.stream = stream;
  const d = document.getElementById("deptList");
  d.innerHTML = "";
  departments[stream].forEach(dep=>{
    const btn = document.createElement("button");
    btn.className="btn";
    btn.textContent = dep;
    btn.onclick = ()=>selectDept(dep);
    d.appendChild(btn);
  });
  showSection("departmentSection");
}

function selectDept(dep){
  state.dept = dep;
  const s = document.getElementById("semList");
  s.innerHTML = "";
  const max = state.stream==="engineering"?8:6;
  for(let i=1;i<=max;i++){
    const btn = document.createElement("button");
    btn.className="btn";
    btn.textContent = "Semester "+i;
    btn.onclick = ()=>selectSem(i);
    s.appendChild(btn);
  }
  showSection("semesterSection");
}

function selectSem(sem){
  state.sem = sem;
  state.grades = {};
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  document.getElementById("semTitle").textContent = "Semester "+sem;

  let arr = subjectsData[state.stream][sem] || [];
  if(state.dept==="AA") arr = subjectsData.aa[sem] || [];

  arr.forEach((sub,i)=>{
    const div = document.createElement("div");
    div.className="card";
    div.innerHTML = `
      <b>${sub.name}</b> (${sub.credits} credits)
      <select onchange="state.grades[${i}]=gradePoints[this.value]">
        <option value="">Select Grade</option>
        ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join("")}
      </select>`;
    list.appendChild(div);
  });
  showSection("subjectsSection");
}

function calculateGPA(){
  let arr = subjectsData[state.stream][state.sem] || [];
  if(state.dept==="AA") arr = subjectsData.aa[state.sem] || [];

  let total=0, credits=0;
  for(let i=0;i<arr.length;i++){
    if(state.grades[i]==null){
      alert("Please select all grades");
      return;
    }
    total += state.grades[i]*arr[i].credits;
    credits += arr[i].credits;
  }

  const gpa = (total/credits).toFixed(2);
  state.gpaHistory[state.sem-1] = Number(gpa);
  document.getElementById("gpa").textContent = gpa;
  document.getElementById("cgpa").textContent = calcCGPA();
  drawChart();
  showSection("resultSection");
}

function calcCGPA(){
  const v = state.gpaHistory.filter(x=>x!=null);
  return (v.reduce((a,b)=>a+b,0)/v.length).toFixed(2);
}

function drawChart(){
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"),{
    type:"line",
    data:{
      labels: state.gpaHistory.map((_,i)=>"Sem "+(i+1)),
      datasets:[{
        data: state.gpaHistory,
        borderColor:"#7c3aed",
        tension:0.4,
        borderWidth:3
      }]
    },
    options:{
      scales:{y:{min:0,max:10}}
    }
  });
}

function convertToPercentage(){
  const cg = document.getElementById("cgpaInput").value;
  document.getElementById("percentResult").textContent =
    "Percentage: "+(cg*10).toFixed(1)+"%";
}