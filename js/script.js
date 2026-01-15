const pages = document.querySelectorAll(".page");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const homeIcon = document.getElementById("home-icon");
const graphIcon = document.getElementById("graph-icon");
const faqIcon = document.getElementById("faq-icon");
const floatingSaveBtn = document.getElementById("floating-save-btn");
const resetBtn = document.getElementById("reset-semesters");

const departmentsDiv = document.getElementById("departments");
const semestersDiv = document.getElementById("semesters");
const subjectsList = document.getElementById("subjects-list");
const calculateBtn = document.getElementById("calculate-btn");

const gpaDisplay = document.getElementById("gpa-display");
const cgpaDisplay = document.getElementById("cgpa-display");
const percentageDisplay = document.getElementById("percentage-display");
const encouragement = document.getElementById("encouragement");

const savedList = document.getElementById("saved-list");
const finalCgpa = document.getElementById("final-cgpa");

const gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};
const departmentsData = {engineering:["CSE","ECE","EEE","ISE","AA"], bcom:["BCom"]};

let selectedStream="", selectedDepartment="", selectedSemester=0;
let subjects=[], grades={};
let semesterGPAs = JSON.parse(localStorage.getItem("semesterGPAs")) || [];

function showPage(id){
    pages.forEach(p=>p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0,0);
}

startBtn.onclick = ()=>showPage("stream-page");
backBtn.onclick = ()=>showPage("start-page");
homeIcon.onclick = ()=>showPage("start-page");
faqIcon.onclick = ()=>showPage("faq-page");
graphIcon.onclick = ()=>{
    showGraph();
    showPage("graph-page");
};
floatingSaveBtn.onclick = ()=>{
    renderSaved();
    showPage("saved-page");
};
resetBtn.onclick = ()=>{
    if(confirm("Reset all saved semesters?")){
        localStorage.removeItem("semesterGPAs");
        semesterGPAs=[];
        renderSaved();
    }
};

/* STREAM SELECTION */
document.querySelectorAll(".stream-btn").forEach(btn=>{
    btn.onclick=()=>{
        selectedStream = btn.dataset.stream;
        loadDepartments();
        showPage("department-page");
    };
});

/* DEPARTMENTS */
function loadDepartments(){
    departmentsDiv.innerHTML="";
    departmentsData[selectedStream].forEach(dep=>{
        const b=document.createElement("button");
        b.textContent=dep;
        b.onclick=()=>{
            selectedDepartment = dep.toLowerCase();
            loadSemesters();
            showPage("semester-page");
        };
        departmentsDiv.appendChild(b);
    });
}

/* SEMESTERS */
function loadSemesters(){
    semestersDiv.innerHTML="";
    for(let i=1;i<=8;i++){
        const b=document.createElement("button");
        b.textContent=`Semester ${i}`;
        b.onclick=()=>{
            selectedSemester=i;
            loadSubjects();
            showPage("subjects-page");
        };
        semestersDiv.appendChild(b);
    }
}

/* LOAD SUBJECTS */
async function loadSubjects(){
    subjectsList.innerHTML="Loading...";
    grades={};
    try{
        const res = await fetch(`data/${selectedDepartment}_sem${selectedSemester}.json`);
        const data = await res.json();
        subjects = data.subjects;
        subjectsList.innerHTML="";
        subjects.forEach(s=>{
            const div=document.createElement("div");
            div.className="subject";
            div.innerHTML=`<strong>${s.code} - ${s.name} (${s.credits} Cr)</strong>`;
            Object.keys(gradePoints).forEach(g=>{
                const btn=document.createElement("button");
                btn.textContent=g;
                btn.onclick=()=>{
                    grades[s.code]=g;
                    div.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
                    btn.classList.add("active");
                };
                div.appendChild(btn);
            });
            subjectsList.appendChild(div);
        });
    }catch(err){
        subjectsList.innerHTML="❌ Subjects file not found!";
        console.error(err);
    }
}

/* CALCULATE */
calculateBtn.onclick=()=>{
    if(Object.keys(grades).length<subjects.length){ alert("Select grades for all subjects."); return; }
    let total=0, creditsSum=0;
    subjects.forEach(s=>{ total+=gradePoints[grades[s.code]]*s.credits; creditsSum+=s.credits; });
    const gpa=(total/creditsSum).toFixed(2);
    semesterGPAs[selectedSemester-1]=Number(gpa);
    localStorage.setItem("semesterGPAs", JSON.stringify(semesterGPAs));

    const valid = semesterGPAs.filter(n=>n!==null && n!==undefined);
    const cgpa = (valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2);

    gpaDisplay.textContent=`GPA: ${gpa}`;
    cgpaDisplay.textContent=`CGPA: ${cgpa}`;
    percentageDisplay.textContent=`Percentage: ${(cgpa*9.5).toFixed(2)}%`;
    encouragement.textContent = cgpa>=9?"Excellent! Keep it up 💜":cgpa>=8?"Great job! 🎉":cgpa>=7?"Good, can improve 🙂":"Keep trying! 💪";
};

/* SAVED SEMESTER */
function renderSaved(){
    savedList.innerHTML="";
    semesterGPAs.forEach((g,i)=>{
        if(g) {
            const d=document.createElement("div");
            d.className="saved-card";
            d.textContent=`Semester ${i+1} : GPA ${g}`;
            savedList.appendChild(d);
        }
    });
    const valid = semesterGPAs.filter(n=>n);
    finalCgpa.textContent= valid.length?`Final CGPA : ${(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(2)}`:"";
}

/* FAQ toggle */
document.querySelectorAll(".faq-question").forEach(q=>q.onclick=()=>q.parentElement.classList.toggle("active"));

/* CHART.JS GRAPH */
let gpaChart;
function showGraph(){
    const valid = semesterGPAs.map(g=>g||0);
    const labels = valid.map((_,i)=>`Sem ${i+1}`);
    const ctx=document.getElementById("gpaChart").getContext("2d");
    if(gpaChart) gpaChart.destroy();
    gpaChart=new Chart(ctx,{
        type:'line',
        data:{
            labels:labels,
            datasets:[{
                label:"Semester GPA",
                data:valid,
                borderColor:'#6a5cff',
                backgroundColor:'rgba(106,92,255,0.2)',
                fill:true,
                tension:0.4,
                pointBackgroundColor:'#9f7aea',
                pointRadius:6,
                pointHoverRadius:8
            }]
        },
        options:{
            responsive:true,
            plugins:{legend:{display:false}, tooltip:{callbacks:{label:ctx=>`GPA: ${ctx.raw}`}} },
            scales:{y:{min:0,max:10,ticks:{stepSize:1}}}
        }
    });
}