// ===== Grade Points =====
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// ===== Departments =====
const departments = {
    engineering: ["CSE","ISE","ECE","EEE","AA"],
    bcom: ["BCOM"]
};

// ===== Subjects Data (your data) =====
const subjectsData = {
    engineering: {
        1: [{name:"Maths",credits:4},{name:"Physics",credits:3}],
        2: [{name:"DS",credits:4},{name:"OOPS",credits:3}],
        3: [{name:"DBMS",credits:4},{name:"TOC",credits:3}],
        4: [{name:"OS",credits:4},{name:"CN",credits:3}],
        5: [{name:"AI",credits:3},{name:"ML",credits:3}],
        6: [{name:"Cloud Computing",credits:3},{name:"Cyber Security",credits:3}],
        7: [{name:"Elective1",credits:3},{name:"Elective2",credits:3}],
        8: [{name:"Project",credits:6}]
    },
    bcom: {
        1: [{name:"Financial Accounting",credits:4}],
        2: [{name:"Business Economics",credits:4}],
        3: [{name:"Corporate Law",credits:3}],
        4: [{name:"Cost Accounting",credits:3}],
        5: [{name:"Income Tax",credits:3}],
        6: [{name:"Auditing",credits:3}],
        7: [{name:"Management Accounting",credits:3}],
        8: [{name:"Project",credits:6}]
    }
};

// ===== State =====
let state = {
    stream: null,
    dept: null,
    sem: null,
    grades: {},
    gpaHistory: Array(8).fill(null)
};

let chart;

// ===== Utility: Show Section =====
function show(id){
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

// ===== Stream Selection =====
function selectStream(stream){
    state.stream = stream;
    const deptDiv = document.getElementById("deptList");
    deptDiv.innerHTML = "";
    departments[stream].forEach(d => {
        const btn = document.createElement("button");
        btn.textContent = d;
        btn.onclick = () => selectDept(d);
        deptDiv.appendChild(btn);
    });
    show("department");
}

// ===== Department Selection =====
function selectDept(dept){
    state.dept = dept;
    const semDiv = document.getElementById("semList");
    semDiv.innerHTML = "";
    for(let i=1;i<=8;i++){
        const btn = document.createElement("button");
        btn.textContent = `Semester ${i}`;
        btn.onclick = () => selectSem(i);
        semDiv.appendChild(btn);
    }
    show("semester");
}

// ===== Semester Selection =====
function selectSem(sem){
    state.sem = sem;
    state.grades = {};
    const list = document.getElementById("subjectList");
    document.getElementById("semTitle").innerText = `Semester ${sem}`;
    list.innerHTML = "";

    const subjects = subjectsData[state.stream][sem] || [];
    subjects.forEach((sub, i) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            ${sub.name} (${sub.credits} credits)
            <select onchange="state.grades[${i}]=gradePoints[this.value]">
                <option value="">Grade</option>
                ${Object.keys(gradePoints).map(g => `<option>${g}</option>`).join("")}
            </select>
        `;
        list.appendChild(card);
    });
    show("subjects");
}

// ===== Calculate GPA =====
function calculateGPA(){
    const subjects = subjectsData[state.stream][state.sem];
    let total=0, credits=0;

    for(let i=0;i<subjects.length;i++){
        if(state.grades[i]==null){
            alert("Please select all grades!");
            return;
        }
        total += state.grades[i]*subjects[i].credits;
        credits += subjects[i].credits;
    }

    const gpa = +(total/credits).toFixed(2);
    state.gpaHistory[state.sem-1] = gpa;

    document.getElementById("gpa").innerText = gpa;
    document.getElementById("cgpa").innerText = calcCGPA();
    drawChart();
    show("result");
}

// ===== Calculate CGPA =====
function calcCGPA(){
    const valid = state.gpaHistory.filter(x=>x!=null);
    if(valid.length===0) return 0;
    return (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);
}

// ===== Draw Chart =====
function drawChart(){
    if(chart) chart.destroy();
    chart = new Chart(document.getElementById("chart"),{
        type: "line",
        data: {
            labels: state.gpaHistory.map((_,i)=>`Sem ${i+1}`),
            datasets: [{
                label: "GPA",
                data: state.gpaHistory,
                borderColor: "#7c3aed",
                backgroundColor: "rgba(124, 58, 237,0.2)",
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 5
            }]
        },
        options: {
            responsive:true,
            scales: {
                y: { min:0, max:10 },
                x: { ticks: { color:"#1f2937" } }
            }
        }
    });
}

// ===== Continue Button =====
document.getElementById("continueBtn").onclick = () => show("stream");

// ===== Back Buttons =====
document.querySelectorAll(".back").forEach(b => {
    b.onclick = () => show(b.dataset.target);
});