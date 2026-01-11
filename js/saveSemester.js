function saveSemester(){
    if(!selectedDept || !selectedSem) return;
    let saved = JSON.parse(localStorage.getItem('savedSemesters')) || {};
    saved[selectedDept] = saved[selectedDept] || {};
    saved[selectedDept][selectedSem] = subjects.map(s=>({
        name: s.name,
        credits: s.credits,
        grade: s.selected || null
    }));
    localStorage.setItem('savedSemesters', JSON.stringify(saved));
    alert(`Semester ${selectedSem} saved!`);
}

function loadSavedSemester(dept, sem){
    let saved = JSON.parse(localStorage.getItem('savedSemesters')) || {};
    if(saved[dept] && saved[dept][sem]){
        subjects.forEach((s,i)=>{ s.selected = saved[dept][sem][i].grade; });
        displaySubjects();
    } else alert("No saved data for this semester.");
}

function deleteSemester(dept, sem){
    let saved = JSON.parse(localStorage.getItem('savedSemesters')) || {};
    if(saved[dept] && saved[dept][sem]){
        delete saved[dept][sem];
        localStorage.setItem('savedSemesters', JSON.stringify(saved));
        alert(`Semester ${sem} of ${dept} deleted`);
        loadSubjects();
    } else alert("No data to delete.");
}