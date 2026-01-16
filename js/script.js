let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={};
let savedSemesters=JSON.parse(localStorage.getItem("savedSemesters"))||[];
let semesterChart;

const departments={
  engineering:["CSE","ISE","ECE","EEE","AA"],
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
function selectStream(stream){
  selectedStream = stream;

  document.querySelectorAll(".cube-btn").forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");

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
  grades = {};
  const list = document.getElementById("subjects-list");
  list.innerHTML = "Loading subjects...";

  const file = `data/${selectedDepartment}_sem${selectedSemester}.json`;

  fetch(file)
    .then(res => {
      if(!res.ok) throw new Error("File not found");
      return res.json();
    })
    .then(data => {
      subjects = data;
      list.innerHTML = "";

      subjects.forEach(s => {
        const div = document.createElement("div");
        div.className = "subject";
        div.innerHTML = `
          <div>
            <strong>${s.code}</strong><br>
            ${s.name} (${s.credits} credits)
          </div>
          <div class="grade-buttons">
            ${Object.keys(gradePoints).map(g =>
              `<button onclick="selectGrade('${s.code}','${g}',this)">${g}</button>`
            ).join("")}
          </div>
        `;
        list.appendChild(div);
      });

      showPage("subjects-page");
    })
    .catch(err=>{
      alert("Subjects file missing:\n" + file);
      console.error(err);
    });
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
  showPage("graph-page");

  const data = Array(8).fill(null);
  savedSemesters.forEach(s=>{
    data[s.semester-1] = s.gpa;
  });

  const ctx = document.getElementById("semesterChart").getContext("2d");
  if(semesterChart) semesterChart.destroy();

  semesterChart = new Chart(ctx,{
    type:"line",
    data:{
      labels:["Sem1","Sem2","Sem3","Sem4","Sem5","Sem6","Sem7","Sem8"],
      datasets:[{
        label:"Semester GPA",
        data:data,
        borderColor:"#6a11cb",
        backgroundColor:"rgba(106,17,203,0.25)",
        fill:true,
        tension:0.45,
        pointRadius:6,
        pointHoverRadius:8,
        pointBackgroundColor:"#ffffff",
        pointBorderColor:"#6a11cb",
        pointBorderWidth:3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{
          labels:{
            boxWidth:35,
            color:"#6a11cb",
            font:{size:14,weight:"500"}
          }
        }
      },
      scales:{
        y:{
          min:0,
          max:10,
          ticks:{
            stepSize:2,
            color:"#777"
          },
          grid:{
            color:"rgba(0,0,0,0.08)"
          }
        },
        x:{
          ticks:{color:"#777"},
          grid:{display:false}
        }
      }
    }
  });
}

function showSaved(){
  showPage("saved-page");
  const list = document.getElementById("saved-list");
  list.innerHTML = "";

  if(savedSemesters.length === 0){
    list.innerHTML = "<p>No saved data</p>";
    return;
  }

  savedSemesters.forEach(s=>{
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <strong>Semester ${s.semester}</strong>
      <span>GPA: ${s.gpa}</span>
    `;
    list.appendChild(div);
  });
}