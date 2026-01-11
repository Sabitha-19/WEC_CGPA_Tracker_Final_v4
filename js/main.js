// Grade points
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// Streams & Departments
const streams = ["Engineering", "BCom"];
const departments = {
  Engineering: ["CSE","ISE","ECE","EEE","AA"],
  BCom: ["BCOM"]
};

let currentStream = "";
let currentDept = "";
let currentSem = 1;
let subjects = [];

// Show section helper
function showSection(id){
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Start & Info
document.getElementById("startBtn").onclick = () => showSection("info");
document.getElementById("infoContinue").onclick = () => showSection("stream");

// Back Buttons
document.querySelectorAll(".back").forEach(b => {
  b.onclick = () => showSection(b.dataset.target);
});

// Load stream buttons
const streamList = document.getElementById("streamList");
streams.forEach(str => {
  const btn = document.createElement("button");
  btn.textContent = str;
  btn.onclick = () => {
    currentStream = str;
    [...streamList.children].forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    loadDepartments();
    showSection("department");
  };
  streamList.appendChild(btn);
});

// Load departments
function loadDepartments(){
  const deptDiv = document.getElementById("deptList");
  deptDiv.innerHTML = "";
  departments[currentStream].forEach(dep => {
    const btn = document.createElement("button");
    btn.textContent = dep;
    btn.onclick = () => {
      currentDept = dep;
      [...deptDiv.children].forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      loadSemesters();
      showSection("semester");
    };
    deptDiv.appendChild(btn);
  });
}

// Load semesters
function loadSemesters(){
  const semDiv = document.getElementById("semList");
  semDiv.innerHTML = "";
  for(let i=1; i<=8; i++){
    const btn = document.createElement("button");
    btn.textContent = `Semester ${i}`;
    btn.onclick = () => {
      currentSem = i;
      [...semDiv.children].forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      loadSubjects();
      showSection("subjects");
    };
    semDiv.appendChild(btn);
  }
}

// Load subjects from JSON
function loadSubjects(){
  const list = document.getElementById("subjectList");
  list.innerHTML = "";
  document.getElementById("semTitle").innerText = `${currentDept} - Semester ${currentSem}`;

  const deptFile = currentDept.toLowerCase();
  const filePath = `data/${deptFile}_sem${currentSem}.json`;

  fetch(filePath)
    .then(res => res.json())
    .then(data => {
      // If JSON contains array at top or inside property
      subjects = Array.isArray(data) ? data : (data.subjects || []);
      if(!Array.isArray(subjects)){
        alert("Invalid JSON format in data file. Must be array or have property 'subjects'.");
        return;
      }
      if(subjects.length === 0){
        alert("No subjects found in JSON.");
      }
      subjects.forEach(sub => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          ${sub.name} (${sub.credits} Cr)
          <select data-name="${sub.name}">
            <option>S</option><option>A</option><option>B</option>
            <option>C</option><option>D</option><option>E</option><option>F</option>
          </select>
        `;
        list.appendChild(div);
      });
    })
    .catch(err => {
      alert("Subject file not found! Check data path & file name.");
      console.error(err);
    });
}

// GPA / CGPA calculation
document.getElementById("calcGPA").onclick = () => {
  let totalCredits=0, totalPoints=0;
  document.querySelectorAll("#subjectList select").forEach(sel => {
    const grade = sel.value;
    const name = sel.dataset.name;
    const credit = subjects.find(s=>s.name===name).credits;
    totalCredits += credit;
    totalPoints += gradePoints[grade]*credit;
  });

  const gpa = (totalPoints/totalCredits).toFixed(2);
  document.getElementById("gpa").innerText = gpa;

  // Save semester
  const saved = JSON.parse(localStorage.getItem("semesters")|| "{}");
  if(!saved[currentDept]) saved[currentDept]={};
  saved[currentDept][currentSem]=parseFloat(gpa);
  localStorage.setItem("semesters", JSON.stringify(saved));

  const avg = calculateCGPA();
  document.getElementById("cgpa").innerText = avg.toFixed(2);
  document.getElementById("percentage").innerText = (avg*9.5).toFixed(2)+"%";

  showChart();
  showSection("result");
};

// CGPA calculation
function calculateCGPA(){
  const saved = JSON.parse(localStorage.getItem("semesters")||"{}");
  let total=0, count=0;
  for(let dept in saved){
    for(let sem in saved[dept]){
      total += saved[dept][sem];
      count++;
    }
  }
  return count? total/count : 0;
}