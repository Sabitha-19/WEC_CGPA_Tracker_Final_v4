// Streams and Departments
const streams = {
  engineering: ["CSE","ISE","ECE","EEE","AA"], // ✅ AA instead of ME
  bcom:["BCOM"]
};

// Pages
const screens = {
  home: document.getElementById("home-screen"),
  department: document.getElementById("department-screen"),
  semester: document.getElementById("semester-screen"),
  subjects: document.getElementById("subjects-screen"),
  chart: document.getElementById("chart-screen"),
  info: document.getElementById("info-screen")
};

// Navigation
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

let selectedStream = null;
let selectedDept = null;
let selectedSemester = null;
let cgpaData = JSON.parse(localStorage.getItem("cgpaData")||"{}");

// Stream Buttons
document.querySelectorAll("#stream-grid button").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedStream = btn.dataset.stream;
    loadDepartments();
    showScreen("department");
  });
});

function loadDepartments() {
  const grid = document.getElementById("department-grid");
  grid.innerHTML = "";
  streams[selectedStream].forEach(dep => {
    let btn = document.createElement("button");
    btn.textContent = dep;
    btn.addEventListener("click", () => {
      selectedDept = dep;
      loadSemesters();
      showScreen("semester");
    });
    grid.appendChild(btn);
  });
}

// Semester buttons
function loadSemesters() {
  const grid = document.getElementById("semester-grid");
  grid.innerHTML = "";
  for(let i=1;i<=8;i++){
    let btn = document.createElement("button");
    btn.textContent = "Semester "+i;
    btn.addEventListener("click", () => {
      selectedSemester = i;
      loadSubjects();
      showScreen("subjects");
    });
    grid.appendChild(btn);
  }
}

// Subjects & CGPA
function loadSubjects() {
  const list = document.getElementById("subjects-list");
  list.innerHTML = "";
  fetch(`data/${selectedDept.toLowerCase()}_sem${selectedSemester}.json`)
    .then(res => res.json())
    .then(subjects=>{
      subjects.forEach(s=>{
        let div = document.createElement("div");
        div.innerHTML = `${s.name} (${s.credits} cr) : <input type="text" data-credits="${s.credits}" placeholder="Grade">`;
        list.appendChild(div);
      });
    })
    .catch(()=>{
      alert("Data file not found for this semester");
    });
}

// Calculate CGPA
document.getElementById("calculate-btn").addEventListener("click",()=>{
  let inputs = document.querySelectorAll("#subjects-list input");
  let totalPoints=0, totalCredits=0;
  inputs.forEach(input=>{
    let grade = input.value.toUpperCase();
    let credits = Number(input.dataset.credits);
    let gp = gradePoints[grade]||0;
    totalPoints += gp*credits;
    totalCredits += credits;
  });
  let cgpa = totalPoints/totalCredits;
  document.getElementById("cgpa-result").textContent = "CGPA: "+cgpa.toFixed(2);
  showEncouragement(cgpa);
  if(!cgpaData[selectedDept]) cgpaData[selectedDept] = {};
  cgpaData[selectedDept][selectedSemester] = cgpa.toFixed(2);
  localStorage.setItem("cgpaData", JSON.stringify(cgpaData));
});

const gradePoints = { S:10,A:9,B:8,C:7,D:6,E:5,F:0 };

function showEncouragement(cgpa){
  const msg = document.getElementById("encourage-msg");
  if(cgpa>=9) msg.textContent="🌟 Amazing! Keep up the excellent work!";
  else if(cgpa>=8) msg.textContent="👍 Great job! You are doing very well!";
  else if(cgpa>=7) msg.textContent="🙂 Good! Keep improving!";
  else msg.textContent="💪 Don't give up! You can do better!";
}

// Back buttons
document.querySelectorAll(".back-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    showScreen("home"); // Default to home
  });
});

// Nav icons
document.getElementById("home-btn").addEventListener("click",()=>showScreen("home"));
document.getElementById("chart-btn").addEventListener("click",showChart);
document.getElementById("save-btn").addEventListener("click",()=>alert("Data saved!"));

// Chart
function showChart(){
  showScreen("chart");
  const ctx = document.getElementById("cgpaChart").getContext("2d");
  const semesters = Object.keys(cgpaData[selectedDept]||{}).map(s=>"Sem "+s);
  const cgpas = Object.values(cgpaData[selectedDept]||{}).map(Number);
  new Chart(ctx,{
    type:'line',
    data:{
      labels:semesters,
      datasets:[{
        label:`${selectedDept} CGPA`,
        data: cgpas,
        backgroundColor:'rgba(100,50,200,0.2)',
        borderColor:'rgba(100,50,200,0.7)',
        borderWidth:2,
        fill:true
      }]
    },
    options:{
      scales:{y:{beginAtZero:true,max:10}}
    }
  });
}