// Auto-save semester grades in localStorage
function saveSemester() {
    if(!state.stream || !state.dept || !state.sem) return;
    const key = `${state.stream}_${state.dept}_sem${state.sem}`;
    const subjectsPath = `data/${state.dept}_sem${state.sem}.json`;

    fetch(subjectsPath)
    .then(res => res.json())
    .then(subjects => {
        const data = subjects.map((sub,i)=>({
            name: sub.name,
            credits: sub.credits,
            grade: state.grades[i] || null
        }));
        localStorage.setItem(key, JSON.stringify(data));
        alert(`Semester ${state.sem} saved!`);
        loadSavedSemesters(); // refresh list
    })
    .catch(()=>alert('Cannot save: subjects file not found.'));
}

// Load all saved semesters
function loadSavedSemesters() {
    const savedDiv = document.getElementById('savedSemesters');
    if(!savedDiv) return; // create if needed
    savedDiv.innerHTML = '';

    Object.keys(localStorage).forEach(k=>{
        if(k.includes('_sem')){
            const semBtn = document.createElement('div');
            semBtn.className = 'subject-card';
            const data = JSON.parse(localStorage.getItem(k));
            const gpa = calculateSavedGPA(data);
            semBtn.innerHTML = `<strong>${k.replace(/_/g,' ').toUpperCase()}</strong> - GPA: ${gpa.toFixed(2)}`;

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = ()=>loadSavedSemesterForEdit(k);
            semBtn.appendChild(editBtn);

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.onclick = ()=>{
                localStorage.removeItem(k);
                loadSavedSemesters();
                alert('Deleted successfully!');
            };
            semBtn.appendChild(delBtn);

            savedDiv.appendChild(semBtn);
        }
    });
}

// Calculate GPA from saved semester data
function calculateSavedGPA(data){
    let total=0, credits=0;
    data.forEach(s=>{
        if(s.grade!=null){
            total += s.grade*s.credits;
            credits += s.credits;
        }
    });
    return credits ? total/credits : 0;
}

// Load saved semester into current state for editing
function loadSavedSemesterForEdit(key){
    const data = JSON.parse(localStorage.getItem(key));
    if(!data) return;
    const parts = key.split('_'); // stream, dept, sem
    state.stream = parts[0];
    state.dept = parts[1];
    state.sem = parseInt(parts[2].replace('sem',''));
    state.grades = {};

    data.forEach((sub,i)=>state.grades[i]=sub.grade);

    loadSubjects();
    alert('Loaded semester for editing. Click grades to modify.');
}

// Auto-load saved semesters on page load
document.addEventListener('DOMContentLoaded', loadSavedSemesters);