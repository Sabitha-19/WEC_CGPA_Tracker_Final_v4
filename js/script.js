const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

const departments = {
  engineering: ["CSE","ISE","ECE","EEE","MECH","CIVIL","AI&DS","AA"],
  bcom: ["BCOM"]
};

const subjectsData = {
  engineering: {
    1: [{ name:"Maths", credits:4 }, { name:"Physics", credits:3 }],
    2: [{ name:"DS", credits:4 }, { name:"OOPS", credits:3 }]
  },
  bcom: {
    1: [{ name:"Financial Accounting", credits:4 }],
    2: [{ name:"Business Economics", credits:4 }]
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

function show(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function selectStream(s){
  state.stream = s;
  const d = document.getElementById("deptList");
  d.innerHTML = "";
  departments[s].forEach(dep=>{
    d.innerHTML += `<button onclick="selectDept('${dep}')">${dep}</button>`;
  });
  show("department");
}

function selectDept(d){
  state.dept = d;
  const s = document.getElementById("semList");
  s.innerHTML = "";
  for(let i=1;i<=8;i++){
    s.innerHTML += `<button onclick="selectSem(${i})">Semester ${i}</button>`;
  }
  show("semester");
}

function selectSem(sem){
  state.sem = sem;
  state.grades = {};
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  document.getElementById("semTitle").textContent = `Semester ${sem}`;

  const subs = subjectsData[state.stream][sem] || [];
  subs.forEach((sub,i)=>{
    list.innerHTML += `
      <div class="card">
        ${sub.name} (${sub.credits} credits)
        <select onchange="state.grades[${i}]=gradePoints[this.value]">
          <option value="">Grade</option>
          ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join("")}
        </select>
      </div>
    `;
  });
  show("subjects");
}

function calculateGPA(){
  const subs = subjectsData[state.stream][state.sem];
  let total=0, credits=0;

  subs.forEach((s,i)=>{
    if(state.grades[i]==null){ alert("Select all grades"); throw ""; }
    total += state.grades[i]*s.credits;
    credits += s.credits;
  });

  const gpa = +(total/credits).toFixed(2);
  state.gpaHistory[state.sem-1]=gpa;

  document.getElementById("gpa").textContent=gpa;
  document.getElementById("cgpa").textContent=calcCGPA();
  drawChart();

  show("result");
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
      labels:state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
      datasets:[{data:state.gpaHistory, borderColor:"#6d28d9"}]
    },
    options:{scales:{y:{min:0,max:10}}}
  });
}