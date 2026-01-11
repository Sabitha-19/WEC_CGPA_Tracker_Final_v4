let streams = ["Engineering","BCom"];
let departments = {
    Engineering:["CSE","ISE","ECE","EEE","AA"],
    BCom:["BCOM"]
};
let selectedStream, selectedDept, selectedSem;
let subjects = [];
let gradePoints = {S:10,A:9,B:8,C:7,D:6,E:5,F:0};

document.getElementById('startBtn').addEventListener('click',()=>{
    document.getElementById('intro').classList.remove('active');
    document.getElementById('stream').classList.add('active');
    renderStreams();
});

function renderStreams(){
    let container = document.getElementById('streamList');
    container.innerHTML="";
    streams.forEach(s=>{
        let btn = document.createElement('button');
        btn.textContent=s;
        btn.onclick=()=>{selectedStream=s; showSection('department'); renderDepartments();};
        container.appendChild(btn);
    });
}

function renderDepartments(){
    let container = document.getElementById('deptList');
    container.innerHTML="";
    departments[selectedStream].forEach(d=>{
        let btn = document.createElement('button');
        btn.textContent=d;
        btn.onclick=()=>{selectedDept=d; showSection('semester'); renderSemesters();};
        container.appendChild(btn);
    });
}

function renderSemesters(){
    let container = document.getElementById('semList');
    container.innerHTML="";
    for(let i=1;i<=8;i++){
        let btn=document.createElement('button');
        btn.textContent="Semester "+i;
        btn.onclick=()=>{selectedSem=i; loadSubjects();};
        container.appendChild(btn);
    }
}

function showSection(id){
    document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Subjects load from JSON
async function loadSubjects(){
    showSection('subjects');
    document.getElementById('semTitle').textContent=`${selectedDept} Sem ${selectedSem}`;
    let path=`data/${selectedDept.toLowerCase()}_sem${selectedSem}.json`;
    try{
        let res = await fetch(path);
        if(!res.ok) throw new Error("File not found");
        subjects = await res.json();
        displaySubjects();
    }catch(err){
        alert("Subjects file not found: "+err);
    }
}

function displaySubjects(){
    let container=document.getElementById('subjectList');
    container.innerHTML="";
    subjects.forEach((s,i)=>{
        let card=document.createElement('div');
        card.className='subject-card';
        card.innerHTML=`<strong>${s.name}</strong> (${s.credits} Credits)`;
        let gradesDiv=document.createElement('div');
        gradesDiv.className='grades-buttons';
        ["S","A","B","C","D","E","F"].forEach(g=>{
            let b=document.createElement('button');
            b.textContent=g;
            if(s.selected===g) b.classList.add('active');
            b.onclick=()=>{
                s.selected=g;
                displaySubjects();
                calculateGPA();
            };
            gradesDiv.appendChild(b);
        });
        card.appendChild(gradesDiv);
        container.appendChild(card);
    });
    calculateGPA();
}

function calculateGPA(){
    let totalCredits=0, totalPoints=0;
    subjects.forEach(s=>{
        if(s.selected){
            totalCredits+=s.credits;
            totalPoints+=s.credits*gradePoints[s.selected];
        }
    });
    let gpa=(totalPoints/totalCredits||0).toFixed(2);
    let cgpa=gpa; // Simple for demo, can be average of semesters
    let percentage=(cgpa*9.5).toFixed(2);
    document.getElementById('gpa').textContent=gpa;
    document.getElementById('cgpa').textContent=cgpa;
    document.getElementById('percentage').textContent=percentage+"%";

    let msg=document.getElementById('encouragement');
    if(gpa>=9) msg.textContent="Excellent! Keep it up! 🎉";
    else if(gpa>=7) msg.textContent="Good job! You can do even better!";
    else msg.textContent="Keep pushing! You can improve!";
    
    if(window.updateChart) updateChart(selectedSem,gpa);
}

// Back buttons
document.querySelectorAll('.back').forEach(b=>{
    b.onclick=()=> showSection(b.dataset.target);
});