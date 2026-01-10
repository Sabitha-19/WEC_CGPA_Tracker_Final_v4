const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

 

const departments={engineering:["CSE","ISE","ECE","EEE","AA"],bcom:["BCOM"]};

let state={stream:null,dept:null,sem:null,grades:{},gpaHistory:Array(8).fill(null)};
let chart;

function showSection(id){
  document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function selectStream(s){
  state.stream=s;
  const d=document.getElementById("deptList"); d.innerHTML="";
  departments[s].forEach(dep=>{
    const btn=document.createElement("button");
    btn.textContent=dep; btn.onclick=()=>selectDept(dep);
    d.appendChild(btn);
  });
  showSection("departmentSection");
}

function selectDept(dep){
  state.dept=dep;
  const s=document.getElementById("semList"); s.innerHTML="";
  let maxSem=(state.stream=="engineering")?8:6;
  for(let i=1;i<=maxSem;i++){
    const btn=document.createElement("button");
    btn.textContent="Semester "+i; btn.onclick=()=>selectSem(i);
    s.appendChild(btn);
  }
  showSection("semesterSection");
}

function selectSem(sem){
  state.sem=sem; state.grades={};
  const list=document.getElementById("subjectList"); list.innerHTML="";
  document.getElementById("semTitle").textContent="Semester "+sem;

  let subArray=subjectsData[state.stream][sem]||[];
  if(state.dept=="AA") subArray=subjectsData.aa[sem]||[];

  subArray.forEach((sub,i)=>{
    const div=document.createElement("div"); div.className="card";
    div.innerHTML=`${sub.name} (${sub.credits} credits)
      <select onchange="state.grades[${i}]=gradePoints[this.value]">
      <option value="">Grade</option>
      ${Object.keys(gradePoints).map(g=>`<option>${g}</option>`).join("")}
      </select>`;
    list.appendChild(div);
  });
  showSection("subjectsSection");
}

function calculateGPA(){
  let subArray=subjectsData[state.stream][state.sem]||[];
  if(state.dept=="AA") subArray=subjectsData.aa[state.sem]||[];
  let total=0,credits=0;
  for(let i=0;i<subArray.length;i++){
    if(state.grades[i]==null){ alert("Select all grades"); return; }
    total+=state.grades[i]*subArray[i].credits;
    credits+=subArray[i].credits;
  }
  const gpa=(total/credits).toFixed(2);
  state.gpaHistory[state.sem-1]=Number(gpa);
  document.getElementById("gpa").innerText=gpa;
  document.getElementById("cgpa").innerText=calcCGPA();
  drawChart();
  showSection("resultSection");
}

function calcCGPA(){
  const v=state.gpaHistory.filter(x=>x!=null);
  if(v.length===0) return "0.00";
  return (v.reduce((a,b)=>a+b,0)/v.length).toFixed(2);
}

function drawChart(){
  if(chart) chart.destroy();
  chart=new Chart(document.getElementById("chart"),{
    type:"line",
    data:{
      labels:state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
      datasets:[{data:state.gpaHistory,borderColor:"#7c3aed",fill:false,borderWidth:3}]
    },
    options:{scales:{y:{min:0,max:10}}}
  });
}

function convertToPercentage(){
  const val=parseFloat(document.getElementById("cgpaInput").value);
  if(isNaN(val)){document.getElementById("percentResult").textContent="Enter valid CGPA"; return;}
  document.getElementById("percentResult").textContent=`Percentage: ${(val*10).toFixed(1)}%`;
}