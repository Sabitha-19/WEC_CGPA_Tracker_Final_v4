let historyStack = ["home"];
let state = {
  dept: null,
  sem: null,
  subjects: [],
  saved: JSON.parse(localStorage.getItem("wec_saved")) || {}
};

const SUBJECTS = {
  ENG: {
    1: [{code:"MATH",name:"Mathematics",credits:4}],
    2: [{code:"PHY",name:"Physics",credits:4}]
  },
  BCOM: {
    1: [{code:"FA",name:"Financial Accounting",credits:5}],
    2: [{code:"BL",name:"Business Law",credits:5}]
  }
};

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function navigate(id){
  historyStack.push(id);
  showPage(id);
}

function goHome(){
  historyStack=["home"];
  showPage("home");
}

function goBack(){
  if(historyStack.length>1){
    historyStack.pop();
    showPage(historyStack[historyStack.length-1]);
  }
}

function selectDept(d){
  state.dept=d;
  buildSemesters();
  navigate("sem");
}

function buildSemesters(){
  const semList=document.getElementById("semList");
  semList.innerHTML="";
  for(let i=1;i<=8;i++){
    const b=document.createElement("div");
    b.className="dept-btn";
    b.textContent="Semester "+i;
    b.onclick=()=>loadSemester(i);
    semList.appendChild(b);
  }
}

function loadSemester(s){
  state.sem=s;
  state.subjects=SUBJECTS[state.dept][s]||[];
  renderSubjects();
  navigate("calc");
}

function renderSubjects(){
  const el=document.getElementById("subjects");
  el.innerHTML="";
  state.subjects.forEach(sub=>{
    const d=document.createElement("div");
    d.className="subject";
    d.innerHTML=`
      <b>${sub.code}</b> - ${sub.name} (${sub.credits})
      <div class="grade-grid">
        ${["S","A","B","C","D","E","F"].map(g=>`<div class="grade-cell">${g}</div>`).join("")}
      </div>`;
    el.appendChild(d);

    d.querySelectorAll(".grade-cell").forEach(c=>{
      c.onclick=()=>{
        d.querySelectorAll(".grade-cell").forEach(x=>x.classList.remove("active"));
        c.classList.add("active");
        sub.grade=c.textContent;
      };
    });
  });
}

function gradePoint(g){
  return {S:10,A:9,B:8,C:7,D:6,E:5,F:0}[g];
}

function calculateGPA(){
  let tot=0, wt=0;
  state.subjects.forEach(s=>{
    if(!s.grade) return;
    tot+=s.credits;
    wt+=gradePoint(s.grade)*s.credits;
  });
  document.getElementById("totalCredits").textContent=tot;
  document.getElementById("gpa").textContent=(wt/tot).toFixed(2);
}

function saveSemester(){
  const gpa=parseFloat(document.getElementById("gpa").textContent);
  if(!gpa) return;
  state.saved[`Sem${state.sem}`]=gpa;
  localStorage.setItem("wec_saved",JSON.stringify(state.saved));
}

let chart=null;
function openGraph(){
  navigate("graph");
  const labels=Object.keys(state.saved).sort();
  const data=labels.map(l=>state.saved[l]);
  if(chart) chart.destroy();
  chart=new Chart(document.getElementById("gpaChart"),{
    type:"line",
    data:{labels,datasets:[{data,label:"GPA",fill:true,borderColor:"#4f46e5"}]},
    options:{scales:{y:{min:0,max:10}}}
  });
}

function convert(){
  const cgpa=parseFloat(document.getElementById("cgpaInput").value);
  document.getElementById("percentResult").textContent=
    "Percentage: "+(cgpa*9.5).toFixed(2)+"%";
}