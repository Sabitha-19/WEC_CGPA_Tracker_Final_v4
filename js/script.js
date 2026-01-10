let state = {
  stream: "",
  dept: "",
  sem: "",
  saved: JSON.parse(localStorage.getItem("wec_saved")) || [],
  gpaList: []
};

function goTo(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function selectStream(s) {
  state.stream = s;
  goTo("page-dept");

  const depts = s === "engineering"
    ? ["CSE","ISE","ECE","EEE","AA"]
    : ["BCom"];

  const box = document.getElementById("deptList");
  box.innerHTML = "";
  depts.forEach(d => {
    const b = document.createElement("button");
    b.innerText = d;
    b.onclick = () => selectDept(d);
    box.appendChild(b);
  });
}

function selectDept(d) {
  state.dept = d;
  goTo("page-sem");

  const semBox = document.getElementById("semList");
  semBox.innerHTML = "";
  const max = state.stream === "engineering" ? 8 : 6;

  for(let i=1;i<=max;i++){
    const b=document.createElement("button");
    b.innerText="Semester "+i;
    b.onclick=()=>loadSubjects(i);
    semBox.appendChild(b);
  }
}

function loadSubjects(sem) {
  state.sem = sem;
  goTo("page-grade");

  fetch(`data/${state.dept.toLowerCase()}_sem${sem}.json`)
  .then(r=>r.json())
  .then(d=>{
    const subBox=document.getElementById("subjects");
    subBox.innerHTML="";
    d.subjects.forEach((s,i)=>{
      subBox.innerHTML+=`
      <div>
        <b>${s.name}</b> (${s.credits})
        <select id="g${i}">
          <option>S</option><option>A</option><option>B</option>
          <option>C</option><option>D</option><option>E</option><option>F</option>
        </select>
      </div>`;
    });
    state.subjectData=d.subjects;
  });
}

function calculateGPA() {
  let total=0, credits=0;
  const map={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

  state.subjectData.forEach((s,i)=>{
    const g=document.getElementById("g"+i).value;
    total+=map[g]*s.credits;
    credits+=s.credits;
  });

  const gpa=(total/credits).toFixed(2);
  state.gpaList.push(gpa);

  document.getElementById("gpa").innerText=gpa;
  document.getElementById("cgpa").innerText=
    (state.gpaList.reduce((a,b)=>a+Number(b),0)/state.gpaList.length).toFixed(2);

  goTo("page-result");
}

function convert(){
  const v=document.getElementById("cgpaInput").value;
  document.getElementById("percent").innerText=
    "Percentage: "+(v*10).toFixed(1)+"%";
}

function saveSemester(){
  localStorage.setItem("wec_saved",JSON.stringify(state.gpaList));
  alert("Semester saved!");
}

function showGraph(){
  const ctx=document.getElementById("chart");
  new Chart(ctx,{
    type:"line",
    data:{
      labels:state.gpaList.map((_,i)=>"Sem "+(i+1)),
      datasets:[{data:state.gpaList,borderColor:"#6b5cff"}]
    }
  });
}