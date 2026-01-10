const departments = {
    engineering: ["CSE","ISE","ECE","EEE","AA"],
    bcom: ["BCOM"]
};
const semesters = [1,2,3,4,5,6,7,8];

const homeSection = document.getElementById('homeSection');
const streamSection = document.getElementById('streamSection');
const departmentSection = document.getElementById('departmentSection');
const semesterSection = document.getElementById('semesterSection');
const gradeSection = document.getElementById('gradeSection');

document.getElementById('continueBtn').addEventListener('click', () => {
    homeSection.classList.remove('active');
    streamSection.classList.add('active');
});

// Stream buttons
document.querySelectorAll('#streamSection .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const stream = btn.dataset.stream;
        document.querySelectorAll('#streamSection .option-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');

        const deptBtns = document.getElementById('departmentBtns');
        deptBtns.innerHTML = '';
        departments[stream].forEach(dept => {
            const b = document.createElement('button');
            b.textContent = dept;
            b.className = 'option-btn';
            b.addEventListener('click', () => {
                document.querySelectorAll('#departmentBtns .option-btn').forEach(bb=>bb.classList.remove('selected'));
                b.classList.add('selected');
                semesterSection.classList.add('active');
                departmentSection.classList.remove('active');
            });
            deptBtns.appendChild(b);
        });

        streamSection.classList.remove('active');
        departmentSection.classList.add('active');
    });
});

// Back buttons
document.getElementById('backDeptBtn').addEventListener('click', () => {
    departmentSection.classList.remove('active');
    streamSection.classList.add('active');
});
document.getElementById('backSemBtn').addEventListener('click', () => {
    semesterSection.classList.remove('active');
    departmentSection.classList.add('active');
});

// Semester buttons
const semesterBtnsDiv = document.getElementById('semesterBtns');
semesters.forEach(s => {
    const b = document.createElement('button');
    b.textContent = 'Semester ' + s;
    b.className = 'option-btn';
    b.addEventListener('click', () => {
        document.querySelectorAll('#semesterBtns .option-btn').forEach(bb=>bb.classList.remove('selected'));
        b.classList.add('selected');
    });
    semesterBtnsDiv.appendChild(b);
});