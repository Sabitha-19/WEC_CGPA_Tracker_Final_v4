// ===== Grade Points =====
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// ===== Streams & Departments =====
const departments = {
    engineering: ["CSE","ISE","ECE","EEE","AA"],
    bcom: ["BCOM"]
};

// ===== State =====
let state = {
    stream: null,
    dept: null,
    sem: null,
    grades: {},
    gpaHistory: Array(8).fill(null),
    subjects: []
};

let chart;

// ===== Show Section =====
function show(id){
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// ===== Continue from Intro =====
document.getElementById("continueBtn").onclick = () => show("stream");

// ===== Back Buttons =====
document.querySelectorAll(".back").forEach(b => {
    b.onclick = () => {
        show(b.dataset.target);
    };
});

// ===== Stream Selection =====
function loadStreams(){
    const streamDiv = document.getElementById("streamList");
    streamDiv.innerHTML = "";
    Object.keys(departments).forEach(stream => {
        const btn = document.createElement("button");
        btn.textContent = stream.charAt(0).toUpperCase() + stream.slice(1);
        btn.className = "transparent-btn";
        btn.onclick = () => selectStream(stream, btn);
        streamDiv.appendChild(btn);
    });
}

function selectStream(stream, btn){
    state.stream = stream;
    // Highlight active
    document.querySelectorAll("#streamList .transparent-btn").forEach(b => b.classList.remove("active-btn"));
    btn.classList.add("active-btn");
    loadDepartments();
    show("department");
}

// ===== Department Selection =====
function loadDepartments(){
    const deptDiv = document.getElementById("deptList");
    deptDiv.innerHTML = "";
    departments[state.stream].forEach(dept => {
        const btn = document.createElement("button");
        btn.textContent = dept;
        btn.className = "transparent-btn";
        btn.onclick = () => selectDepartment(dept, btn);
        deptDiv.appendChild(btn);
    });
}

function selectDepartment(dept, btn){
    state.dept = dept;
    document.querySelectorAll("#deptList .transparent-btn").forEach(b => b.classList.remove("active-btn"));
    btn.classList.add("active-btn");
    loadSemesters();
    show("semester");
}

// ===== Semester Selection =====
function loadSemesters(){
    const semDiv = document.getElementById("semList");
    semDiv.innerHTML = "";
    for(let i=1;i<=8;i++){
        const btn = document.createElement("button");
        btn.textContent = "Semester " + i;
        btn.className = "transparent-btn";
        btn.onclick = () => selectSemester(i, btn);
        semDiv.appendChild(btn);
    }
}

function selectSemester(sem, btn){
    state.sem = sem;
    document.querySelectorAll("#semList .transparent-btn").forEach(b => b.classList.remove("active-btn"));
    btn.classList.add("active-btn");
    loadSubjects();
    show("subjects");
}

// ===== Load Subjects from JSON =====
async function loadSubjects(){
    const list = document.getElementById("subjectList");
    list.innerHTML = "";
    document.getElementById("semTitle").innerText = "Semester " + state.sem;

    let path = `data/${state.dept.toLowerCase()}_sem${state.sem}.json`;
    try {
        const res = await fetch(path);
        if(!res.ok) throw new Error("File not found");
        const data = await res.json();
        state.subjects = data;  // Save subjects
        state.grades = {};

        data.forEach((sub, idx)=>{
            const card = document.createElement("div");
            card.className = "subject-card";
            card.innerHTML = `<span>${sub.name} (${sub.credits} credits)</span>`;
            const gradeDiv = document.createElement("div");
            gradeDiv.className = "grades-btns";

            Object.keys(gradePoints).forEach(g=>{
                const gBtn = document.createElement("button");
                gBtn.textContent = g;
                gBtn.onclick = () => {
                    state.grades[idx] = gradePoints[g];
                    gradeDiv.querySelectorAll("button").forEach(b=>b.classList.remove("active-grade"));
                    gBtn.classList.add("active-grade");
                    calculateGPA();
                };
                gradeDiv.appendChild(gBtn);
            });

            card.appendChild(gradeDiv);
            list.appendChild(card);
        });
    } catch(e){
        list.innerHTML = `<p style="color:red;">Subject file not found: ${path}</p>`;
    }
}

// ===== Calculate GPA & CGPA =====
function calculateGPA(){
    let total=0, credits=0;
    let allSelected = true;
    state.subjects.forEach((sub, idx)=>{
        if(state.grades[idx]==null) allSelected=false;
        total += (state.grades[idx]||0) * sub.credits;
        credits += sub.credits;
    });
    if(!allSelected) return; // wait until all grades selected
    const gpa = +(total/credits).toFixed(2);
    state.gpaHistory[state.sem-1] = gpa;
    document.getElementById("gpa").innerText = gpa;
    const cgpa = calcCGPA();
    document.getElementById("cgpa").innerText = cgpa;
    document.getElementById("percentage").innerText = (cgpa*9.5).toFixed(2) + "%";
    showEncouragement(cgpa);
    drawChart();
}

// ===== Calculate CGPA =====
function calcCGPA(){
    const valid = state.gpaHistory.filter(x=>x!=null);
    if(valid.length===0) return 0;
    return (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);
}

// ===== Encouragement Message =====
function showEncouragement(cgpa){
    const msg = document.getElementById("encouragement");
    if(cgpa>=9) msg.innerText="🌟 Excellent! Keep it up!";
    else if(cgpa>=8) msg.innerText="👍 Very Good! Stay consistent.";
    else if(cgpa>=7) msg.innerText="🙂 Good job! You can improve.";
    else if(cgpa>=6) msg.innerText="⚠️ Average, focus on your studies.";
    else msg.innerText="🚨 Work harder! You can do it!";
}

// ===== Icons =====
document.getElementById("homeBtn").onclick = ()=> show("intro");
document.getElementById("graphBtn").onclick = ()=> show("result");

// ===== Initialize =====
loadStreams();