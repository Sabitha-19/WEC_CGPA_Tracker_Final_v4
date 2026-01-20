let selectedStream="",selectedDepartment="",selectedSemester=0;
let subjects=[],grades={};
let savedSemesters=JSON.parse(localStorage.getItem("savedSemesters"))||[];
let semesterChart=null;

const departments={
  engineering:["cse","ise","ece","eee","aa"],
  bcom:["bcom"]
};
const gradePoints={S:10,A:9,B:8,C:7,D:6,E:5,F:0};

/* PAGE NAVIGATION */
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id!=="start-page") document.getElementById("faq-section")?.classList.add("hidden");
}

/* STREAM/DEPT/SEMESTER SELECTION */
function selectStream(s,btn){selectedStream=s;document.querySelectorAll(".cube-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");showDepartments();showPage("department-page");}
function showDepartments(){const g=document.getElementById("department-grid");g.innerHTML="";departments[selectedStream].forEach(d=>{const b=document.createElement("button");b.className="cube-btn";b.textContent=d.toUpperCase();b.onclick=()=>selectDepartment(d,b);g.appendChild(b);});}
function selectDepartment(d,btn){selectedDepartment=d;document.querySelectorAll("#department-grid button").forEach(b=>b.classList.remove("active"));btn.classList.add("active");showSemesters();showPage("semester-page");}
function showSemesters(){const g=document.getElementById("semester-grid");g.innerHTML="";for(let i=1;i<=8;i++){const b=document.createElement("button");b.className="cube-btn";b.textContent="Semester "+i;b.onclick=()=>selectSemester(i,b);g.appendChild(b);}}
function selectSemester(s,btn){selectedSemester=s;document.querySelectorAll("#semester-grid button").forEach(b=>b.classList.remove("active"));btn.classList.add("active");loadSubjects();}

/* LOAD SUBJECTS */
function loadSubjects(){grades={};fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`).then(r=>r.json()).then(d=>{subjects=d;renderSubjects();}).catch(()=>alert("JSON not found"));}

/* RENDER SUBJECTS */
function renderSubjects(){
  const list=document.getElementById("subjects-list");list.innerHTML="";
  subjects.forEach(s=>{const div=document.createElement("div");div.className="subject";
    div.innerHTML=`<b>${s.code}</b> ${s.name} (${s.credits})
      <div class="grade-buttons">${Object.keys(gradePoints).map(g=>`<button class="grade-btn" onclick="selectGrade('${s.code}','${g}',this)">${g}</button>`).join("")}</div>`;
    list.appendChild(div);
  });
  showPage("subjects-page");
}

/* SELECT GRADE */
function selectGrade(c,g,b){grades[c]=g;b.parentElement.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");}

/* CALCULATE CGPA */
document.getElementById("calculate-btn").onclick=()=>{
  let tc=0,tp=0;
  for(let s of subjects){if(!grades[s.code]) return alert("Select all grades");tc+=s.credits;tp+=s.credits*gradePoints[grades[s.code]];}
  const semCGPA=(tp/tc).toFixed(2);
  const i=savedSemesters.findIndex(x=>x.semester===selectedSemester);
  i>=0?savedSemesters[i].gpa=semCGPA:savedSemesters.push({semester:selectedSemester,gpa:semCGPA});
  localStorage.setItem("savedSemesters",JSON.stringify(savedSemesters));
  const cgpa=(savedSemesters.reduce((a,b)=>a+ +b.gpa,0)/savedSemesters.length).toFixed(2);
  document.getElementById("cgpa-display").innerText="CGPA : "+cgpa;
  document.getElementById("percentage-display").innerText="Percentage : "+(cgpa*9.5).toFixed(2)+"%";
  document.getElementById("encouragement").innerText=getEncouragement(cgpa);
  showPage("result-page");
};

/* ENCOURAGEMENT */
function getEncouragement(cgpa){
  if(cgpa>=9) return "🌟 Outstanding! You are a topper!";
  if(cgpa>=8) return "🔥 Excellent performance! Keep shining!";
  if(cgpa>=7) return "👍 Very good! You’re doing great!";
  if(cgpa>=6) return "🙂 Good effort! Aim higher next semester!";
  return "💪 Don’t give up! Improvement is coming!";
}

/* GRAPH */
function openGraph(){
  showPage("graph-page");
  const data=Array(8).fill(null);
  savedSemesters.forEach(s=>data[s.semester-1]=s.gpa);
  if(semesterChart) semesterChart.destroy();
  semesterChart=new Chart(document.getElementById("semesterChart"),{
    type:"line",
    data:{labels:["S1","S2","S3","S4","S5","S6","S7","S8"],datasets:[{label:"Semester CGPA",data,fill:true,borderColor:"#6a11cb",backgroundColor:"rgba(106,17,203,0.3)",tension:0.4,pointRadius:6}]},
    options:{responsive:true,scales:{y:{beginAtZero:true,max:10}}}
  });
}

/* SAVED SEMESTERS */
function showSaved(){showPage("saved-page");const l=document.getElementById("saved-list");l.innerHTML="";savedSemesters.sort((a,b)=>a.semester-b.semester).forEach(s=>l.innerHTML+=`<div class="subject">Semester ${s.semester} : ${s.gpa}</div>`);}

/* FAQ TOGGLE */
function toggleFAQ(){showPage("start-page");document.getElementById("faq-section").classList.toggle("hidden");}
document.querySelectorAll(".faq-question").forEach(q=>q.addEventListener("click",()=>{const ans=q.nextElementSibling;ans.style.display=(ans.style.display==="block"?"none":"block");}));