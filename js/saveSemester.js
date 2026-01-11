// ===== Local Storage Save & Load =====
function saveSemester(){
    if(!state.stream || !state.dept || !state.sem) return;
    const key = `${state.stream}_${state.dept}_sem${state.sem}`;
    const saveData = { grades: state.grades, subjects: state.subjects };
    localStorage.setItem(key, JSON.stringify(saveData));
}

function loadSavedSemester(){
    if(!state.stream || !state.dept || !state.sem) return;
    const key = `${state.stream}_${state.dept}_sem${state.sem}`;
    const data = localStorage.getItem(key);
    if(data){
        const saved = JSON.parse(data);
        state.grades = saved.grades;
        state.subjects = saved.subjects;
        // Update grade buttons
        const list = document.getElementById("subjectList");
        state.subjects.forEach((sub, idx)=>{
            const gradeDiv = list.children[idx].querySelector(".grades-btns");
            Array.from(gradeDiv.children).forEach(btn=>{
                if(state.grades[idx] == gradePoints[btn.textContent]){
                    btn.classList.add("active-grade");
                } else btn.classList.remove("active-grade");
            });
        });
        calculateGPA();
    }
}

window.addEventListener("beforeunload", saveSemester);