// Pages
const pages = {
    start: document.getElementById("startPage"),
    stream: document.getElementById("streamPage"),
    dept: document.getElementById("deptPage"),
    sem: document.getElementById("semPage"),
    grade: document.getElementById("gradePage"),
    result: document.getElementById("resultPage")
};

function showPage(page) {
    Object.values(pages).forEach(p => p.classList.remove("active"));
    page.classList.add("active");
}

// Start Page
document.getElementById("startBtn").onclick = () => showPage(pages.stream);

// Back buttons
document.querySelectorAll(".backBtn").forEach(btn => btn.onclick = () => {
    if (pages.result.classList.contains("active")) showPage(pages.grade);
    else if (pages.grade.classList.contains("active")) showPage(pages.sem);
    else if (pages.sem.classList.contains("active")) showPage(pages.dept);
    else if (pages.dept.classList.contains("active")) showPage(pages.stream);
});

// Stream selection
let selectedStream = "";
let selectedDept = "";
let selectedSem = "";
let gradesData = {}; // localStorage structure { "cse": { "1": {"Maths":"S"} } }

document.querySelectorAll("#streamPage .btn-purple").forEach(btn => {
    btn.onclick = () => {
        selectedStream = btn.dataset.stream;
        loadDepartments(selectedStream);
        showPage(pages.dept);
    }
});

const departments = {
    engineering:["CSE","ISE","ECE","EEE","AA"],
    bcom:["BCOM"]
};

function loadDepartments(stream) {
    const container = document.getElementById("deptButtons");
    container.innerHTML = "";
    departments[stream].forEach(d => {
        const btn = document.createElement("button");
        btn.className = "btn-purple";
        btn.textContent = d;
        btn.onclick = () => {
            selectedDept = d.toLowerCase();
            loadSemesters(selectedDept);
            showPage(pages.sem);
        };
        container.appendChild(btn);
    });
}

function loadSemesters(dept) {
    const container = document.getElementById("semButtons");
    container.innerHTML = "";
    for (let i=1;i<=8;i++){
        const btn = document.createElement("button");
        btn.className="btn-purple";
        btn.textContent = "Semester "+i;
        btn.onclick = () => {
            selectedSem = i;
            loadSubjects(selectedDept, i);
            showPage(pages.grade);
        };
        container.appendChild(btn);
    }
}

const gradePoints = { "S":10,"A":9,"B":8,"C":7,"D":6,"E":5,"F":0 };

function loadSubjects(dept, sem) {
    const container = document.getElementById("subjectList");
    container.innerHTML = "Loading...";
    fetch(`data/${dept}_sem${sem}.json`).then(res=>res.json()).then(data=>{
        container.innerHTML="";
        data.forEach(sub=>{
            const row = document.createElement("div");
            row.className="subjectRow";
            row.innerHTML = `<span>${sub.name} (${sub.credits}cr)</span>
            <select>
                <option value="">Select</option>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
            </select>`;
            container.appendChild(row);
        });

        // Load previous selection if exists
        const saved = JSON.parse(localStorage.getItem("gradesData") || "{}");
        if (saved[dept] && saved[dept][sem]) {
            const semData = saved[dept][sem];
            container.querySelectorAll(".subjectRow").forEach(row=>{
                const name = row.querySelector("span").textContent.split(" (")[0];
                if (semData[name]) row.querySelector("select").value = semData[name];
            });
        }
    });
}

// Save Semester
document.getElementById("saveSemester").onclick = () => {
    const container = document.getElementById("subjectList");
    const rows = container.querySelectorAll(".subjectRow");
    const semGrades = {};
    rows.forEach(row=>{
        const name = row.querySelector("span").textContent.split(" (")[0];
        const grade = row.querySelector("select").value;
        if(grade) semGrades[name] = grade;
    });

    const saved = JSON.parse(localStorage.getItem("gradesData") || "{}");
    if(!saved[selectedDept]) saved[selectedDept]={};
    saved[selectedDept][selectedSem] = semGrades;
    localStorage.setItem("gradesData", JSON.stringify(saved));
    alert("Semester Saved!");
    calculateResults();
    showPage(pages.result);
}

// Reset Semester
document.getElementById("resetSemester").onclick = () => {
    const saved = JSON.parse(localStorage.getItem("gradesData") || "{}");
    if(saved[selectedDept] && saved[selectedDept][selectedSem]) {
        delete saved[selectedDept][selectedSem];
        localStorage.setItem("gradesData", JSON.stringify(saved));
        loadSubjects(selectedDept, selectedSem);
        alert("Semester Reset!");
    }
}

// Calculate GPA / CGPA
function calculateResults() {
    const saved = JSON.parse(localStorage.getItem("gradesData") || "{}");
    if(!saved[selectedDept]) return;

    const deptData = saved[selectedDept];
    let totalPoints=0, totalCredits=0;
    let labels=[], gpaData=[];
    for(const sem in deptData){
        let semPoints=0, semCredits=0;
        for(const sub in deptData[sem]){
            fetch(`data/${selectedDept}_sem${sem}.json`).then(res=>res.json()).then(subs=>{
                const subData = subs.find(s=>s.name===sub);
                const grade = deptData[sem][sub];
                semPoints += gradePoints[grade]*subData.credits;
                semCredits += subData.credits;
                // Show chart after all semesters loaded
                if(semCredits>0){
                    const semGPA = (semPoints/semCredits).toFixed(2);
                    totalPoints += semPoints;
                    totalCredits += semCredits;
                    labels.push("Sem "+sem);
                    gpaData.push(semGPA);

                    const cgpa = (totalPoints/totalCredits).toFixed(2);
                    document.getElementById("gpaDisplay").textContent = `Semester ${sem} GPA: ${semGPA}`;
                    document.getElementById("cgpaDisplay").textContent = `CGPA: ${cgpa}`;
                    document.getElementById("percentageDisplay").textContent = `Percentage: ${(cgpa*9.5).toFixed(2)}%`;

                    // Chart
                    const ctx = document.getElementById('gpaChart').getContext('2d');
                    new Chart(ctx,{
                        type:'bar',
                        data:{
                            labels:labels,
                            datasets:[{
                                label:'GPA per Semester',
                                data:gpaData,
                                backgroundColor:'rgba(123, 47, 247, 0.7)',
                                borderRadius: 10
                            }]
                        },
                        options:{ responsive:true, plugins:{legend:{display:false}} }
                    });
                }
            });
        }
    }
}