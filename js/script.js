let currentDepartment = "";
let currentSemester = "";
const gradePoints = { S:10, A:9, B:8, C:7, D:6, E:5, F:0 };

// ---------- Department / Semester ----------
function selectDepartment(dep){
    currentDepartment = dep;
    goToScreen('semester-screen');

    const semContainer = document.getElementById("semester-buttons");
    semContainer.innerHTML = "";
    for(let i=1; i<=8; i++){
        const btn = document.createElement("button");
        btn.innerText = `Semester ${i}`;
        btn.onclick = () => selectSemester(dep,i);
        semContainer.appendChild(btn);
    }
}

function selectSemester(dep, sem){
    currentSemester = sem;
    const filePath = `data/${dep.toLowerCase()}_sem${sem}.json`;

    fetch(filePath)
    .then(res => { if(!res.ok) throw new Error(); return res.json(); })
    .then(subjects => showGradesScreen(subjects))
    .catch(err => alert("Semester data not found"));
}

// ---------- Grades Screen ----------
function showGradesScreen(subjects){
    goToScreen('grades-screen');
    document.getElementById("grades-title").innerText = `${currentDepartment} - Semester ${currentSemester}`;

    const container = document.getElementById("grades-container");
    container.innerHTML = "";

    subjects.forEach(sub=>{
        const div = document.createElement("div");
        div.className = "grade-card";
        div.innerHTML = `
            <label>${sub.name} (${sub.credits} cr)</label>
            <select id="grade-${sub.name}">
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
            </select>
        `;
        container.appendChild(div);
    });

    loadSavedGrades(currentDepartment,currentSemester);
}

// ---------- CGPA Calculation & Encouragement ----------
function calculateCGPA(save=true){
    const grades = document.querySelectorAll("#grades-container select");
    let totalPoints=0, totalCredits=0;

    grades.forEach(sel=>{
        const credit = parseFloat(sel.parentElement.innerText.match(/\((\d+)\s*cr\)/)[1]);
        totalCredits += credit;
        totalPoints += gradePoints[sel.value]*credit;
    });

    const cgpa = totalCredits ? (totalPoints/totalCredits).toFixed(2) : 0;

    if(save){
        saveGrades();
        goToScreen('cgpa-info-screen');
        showEncouragement(cgpa);
    }
    return parseFloat(cgpa);
}

// ---------- Encouragement Messages ----------
function showEncouragement(cgpa){
    const msgDiv = document.getElementById("cgpa-message");
    let message="", bg="";

    if(cgpa>=9){ message="Excellent! Keep up the amazing work! 🌟"; bg="rgba(144,238,144,0.3)"; }
    else if(cgpa>=8){ message="Great job! You're doing really well! 👍"; bg="rgba(173,216,230,0.3)"; }
    else if(cgpa>=7){ message="Good effort! Keep pushing for higher! 💪"; bg="rgba(255,255,224,0.3)"; }
    else if(cgpa>=6){ message="Nice! A little more focus and you can improve! ✨"; bg="rgba(255,228,196,0.3)"; }
    else{ message="Don't worry! Review and keep trying, you can do it! 💡"; bg="rgba(255,182,193,0.3)"; }

    msgDiv.innerText = message;
    msgDiv.style.background = bg;
}

// ---------- Save / Load ----------
function saveGrades(){
    const data={};
    document.querySelectorAll("#grades-container select").forEach(sel=>{
        data[sel.id]=sel.value;
    });
    localStorage.setItem(`${currentDepartment}_sem${currentSemester}_grades`, JSON.stringify(data));
}

function loadSavedGrades(dep,sem){
    const saved = localStorage.getItem(`${dep}_sem${sem}_grades`);
    if(saved){
        const data = JSON.parse(saved);
        Object.keys(data).forEach(id=>{
            const sel = document.getElementById(id);
            if(sel) sel.value=data[id];
        });
    }
}

// ---------- Screen Navigation ----------
function goBack(screenId){ goToScreen(screenId); }
function goHome(){ goToScreen('department-screen'); }
function goToScreen(screenId){
    document.querySelectorAll(".screen").forEach(s=>s.style.display="none");
    document.getElementById(screenId).style.display="block";
}

// ---------- CGPA Chart ----------
function showCGPAChart(){
    goToScreen('chart-screen');
    const labels=[], cgpaData=[];
    for(let i=1;i<=8;i++){
        const saved = localStorage.getItem(`${currentDepartment}_sem${i}_grades`);
        if(saved){
            const data = JSON.parse(saved);
            let totalPoints=0, totalCredits=0;
            Object.keys(data).forEach(key=>{
                const creditMatch = document.getElementById(key)?.parentElement.innerText.match(/\((\d+)\s*cr\)/);
                const credit = creditMatch ? parseFloat(creditMatch[1]) : 3;
                totalCredits+=credit;
                totalPoints+=gradePoints[data[key]]*credit;
            });
            const cgpa = totalCredits ? (totalPoints/totalCredits).toFixed(2) : 0;
            labels.push(`Sem ${i}`);
            cgpaData.push(cgpa);
        }
    }

    const ctx = document.getElementById('cgpaChart').getContext('2d');
    if(window.cgpaChartInstance) window.cgpaChartInstance.destroy();

    window.cgpaChartInstance = new Chart(ctx,{
        type:'line',
        data:{
            labels:labels,
            datasets:[{
                label:`${currentDepartment} CGPA`,
                data:cgpaData,
                backgroundColor:'rgba(128,0,128,0.2)',
                borderColor:'rgba(128,0,128,1)',
                borderWidth:2,
                tension:0.4,
                fill:true,
            }]
        },
        options:{ scales:{ y:{ beginAtZero:true, max:10 } } }
    });
}