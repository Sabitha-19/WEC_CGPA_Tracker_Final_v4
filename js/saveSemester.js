// Save, Edit, Delete semester in localStorage
function saveSemesterData(){
  if(!state.stream || !state.dept || !state.sem) return;
  const key = `${state.stream}_${state.dept}_sem${state.sem}`;
  localStorage.setItem(key, JSON.stringify(state.grades));
}

function loadSavedGrades(){
  if(!state.stream || !state.dept || !state.sem) return;
  const key = `${state.stream}_${state.dept}_sem${state.sem}`;
  const saved = localStorage.getItem(key);
  if(saved){
    state.grades = JSON.parse(saved);
    const cards = document.querySelectorAll("#subjectList .card select");
    cards.forEach((sel,i)=>{
      sel.value = Object.keys(gradePoints).find(g=>gradePoints[g]===state.grades[i]) || "";
    });
  }
}

// Edit Button
document.getElementById("editSem").onclick = ()=>{
  loadSavedGrades();
  show("subjects");
}

// Delete Button
document.getElementById("deleteSem").onclick = ()=>{
  if(!state.stream || !state.dept || !state.sem) return;
  const key = `${state.stream}_${state.dept}_sem${state.sem}`;
  localStorage.removeItem(key);
  state.grades = {};
  loadSubjects();
}