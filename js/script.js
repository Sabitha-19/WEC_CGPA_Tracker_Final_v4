let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={};
let savedSemesters=JSON.parse(localStorage.getItem("savedSemesters"))||[];
let semesterChart;

const departments={
  engineering:["CSE","ISE","ECE","EEE","AI"],
  bcom:["BCOM"]
};

const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack(){
  showPage("start-page");
}

document.getElementById("start-btn").onclick=()=>showPage("stream-page");

function selectStream(stream,btn){
  selectedStream=stream;
  document.querySelectorAll(".cube-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showDepartments();
  showPage("department-page");
}

function showDepartments(){
  const grid=document.getElementById("department-grid");
  grid.innerHTML="";
  departments[selectedStream].forEach(d=>{
    const b=document.createElement("button");
    b.className="cube-btn";
    b.innerText=d;
    b.onclick=()=>selectDepartment(d.toLowerCase(),b);
    grid.appendChild(b);
  });
}

function selectDepartment(dep,btn){
  selectedDepartment=dep;
  document.querySelectorAll("#department-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  showSemesters();
  showPage("semester-page");
}

function showSemesters(){
  const grid=document.getElementById("semester-grid");
  grid.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("button");
    b.className="cube-btn";
    b.innerText="Semester "+i;
    b.onclick=()=>selectSemester(i,b);
    grid.appendChild(b);
  }
}

function selectSemester(sem,btn){
  selectedSemester=sem;
  document.querySelectorAll("#semester-grid button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  loadSubjects();
}

function loadSubjects(){
  grades={};
  subjects=[
    {code:"SUB1",name:"Subject 1",credits:3},
    {code:"SUB2",name:"Subject 2",credits:4}
  ];

  const list=document.getElementById("subjects-list");
  list.innerHTML="";
  subjects.forEach(s=>{
    const div=document.createElement("div");
    div.className="subject";
    div.innerHTML=`
      <div>${s.name}</div>
      <div class="grade-buttons">
        ${Object.keys(gradePoints).map(g=>`<button onclick="selectGrade('${s.code}','${g}',this)">${g}</button>`).join("")}
      </div>`;
    list.appendChild(div);
  });
  showPage("subjects-page");
}

function selectGrade(code,grade,btn){
  grades[code]=grade;
  btn.parentElement.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
}

document.getElementById("calculate-btn").onclick=()=>{
  let totalC=0,totalP=0;
  subjects.forEach(s=>{
    if(!grades[s.code]){alert("Select all grades");return;}
    totalC+=s.credits;
    totalP+=s.credits*gradePoints[grades[s.code]];
  });
  const gpa=(totalP/totalC).toFixed(2);

  const all=[...savedSemesters.map(s=>s.gpa),parseFloat(gpa)];
  const cgpa=(all.reduce((a,b)=>a+b,0)/all.length).toFixed(2);

  document.getElementById("gpa-display").innerText="GPA: "+gpa;
  document.getElementById("cgpa-display").innerText="CGPA: "+cgpa;
  document.getElementById("percentage-display").innerText="Percentage: "+(cgpa*9.5).toFixed(2)+"%";
  document.getElementById("encouragement").innerText="Keep going 👏";
  showPage("result-page");
};

function saveSemester(){
  const g=document.getElementById("gpa-display").innerText;
  if(!g){alert("Calculate first");return;}
  savedSemesters.push({semester:selectedSemester,gpa:parseFloat(g.split(": ")[1])});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));
  alert("Saved 💾");
}

function openGraph(){
  if(savedSemesters.length===0){alert("No data");return;}
  showPage("graph-page");
  const data=Array(8).fill(null);
  savedSemesters.forEach(s=>data[s.semester-1]=s.gpa);
  const ctx=document.getElementById("semesterChart");
  if(semesterChart)semesterChart.destroy();
  semesterChart=new Chart(ctx,{
    type:"line",
    data:{labels:["S1","S2","S3","S4","S5","S6","S7","S8"],
    datasets:[{data,fill:true}]},
    options:{scales:{y:{min:0,max:10}}}
  });
}

document.querySelectorAll(".faq-question").forEach(q=>{
  q.onclick=()=>q.nextElementSibling.style.display=
    q.nextElementSibling.style.display==="block"?"none":"block";
});