
import * as DB from "./db.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

const content = document.getElementById("content");

const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card"><h3>Students</h3><p class="number" id="studentCount">0</p></div>
      <div class="card"><h3>Teachers</h3><p class="number" id="teacherCount">0</p></div>
      <div class="card"><h3>Classes</h3><p class="number" id="classCount">0</p></div>
    </div>
    <div class="panel"><h3>Welcome</h3><p>School Management System</p></div>
  `,

  students: `
    <h2>Student Management</h2>
    <div class="panel">
      <h3>Register Student</h3>
      <input id="studentName" placeholder="Student full name">
      <input id="studentId" placeholder="Student ID">
      <button onclick="addStudent()">Add Student</button>
      <p id="studentMessage"></p>
      <div id="studentList"></div>
    </div>
  `,

  teachers: `
    <h2>Teacher Management</h2>
    <div class="panel">
      <h3>Register Teacher</h3>
      <input id="teacherName" placeholder="Teacher full name">
      <input id="teacherId" placeholder="Teacher ID">
      <button onclick="addTeacher()">Add Teacher</button>
      <p id="teacherMessage"></p>
      <div id="teacherList"></div>
    </div>
  `,

  performance: `
    <h2>Teacher Performance</h2>
    <div class="panel">
      <p>Evaluate teacher performance using multiple criteria:</p>
      <ul>
        <li>Student academic progress</li>
        <li>Syllabus coverage</li>
        <li>Lesson preparation</li>
        <li>Attendance and punctuality</li>
        <li>Classroom performance</li>
        <li>Assessment and feedback</li>
        <li>Professional development</li>
      </ul>
      <p>Performance evaluation module will be developed next.</p>
    </div>
  `,

  classes: `
    <h2>Classes & Subjects</h2>
    <div class="panel">
      <h3>Add Class</h3>
      <input id="className" placeholder="Class name (e.g. Grade 9A)">
      <button onclick="addClass()">Add Class</button>
      <p id="classMessage"></p>
      <div id="classList"></div>
    </div>
  `,

  attendance: `
    <h2>Attendance</h2>
    <div class="panel">
      <p>Student and teacher attendance module will be developed next.</p>
    </div>
  `,

  results: `
    <h2>Exams & Results</h2>
    <div class="panel">
      <p>Examination and student results module will be developed next.</p>
    </div>
  `,

  reports: `
    <h2>Reports</h2>
    <div class="panel">
      <p>School reports module will be developed next.</p>
    </div>
  `
};

function showMessage(id, message, isError = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function loadRecords(collectionName, listId) {
  const list = document.getElementById(listId);
  if (!list) return;

  list.textContent = "Loading...";

  try {
    const records = await DB.getRecords(collectionName);

    if (!records.length) {
      list.textContent = "No records found.";
      return;
    }

    list.innerHTML = records.map(record => `
      <div class="panel">
        <strong>${escapeHTML(record.name || "")}</strong>
        <p>${escapeHTML(record.schoolId || "")}</p>
        <button onclick="deleteItem('${collectionName}','${record.id}')">
          Delete
        </button>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
    list.textContent = "Could not load records.";
  }
}

async function addStudent() {
  const name = document.getElementById("studentName")?.value.trim();
  const schoolId = document.getElementById("studentId")?.value.trim();

  if (!name || !schoolId) {
    showMessage("studentMessage", "Please fill in all fields.", true);
    return;
  }

  try {
    await DB.addRecord("students", { name, schoolId });
    document.getElementById("studentName").value = "";
    document.getElementById("studentId").value = "";
    showMessage("studentMessage", "Student added successfully.");
    await loadRecords("students", "studentList");
  } catch (error) {
    console.error(error);
    showMessage("studentMessage", error.message, true);
  }
}

async function addTeacher() {
  const name = document.getElementById("teacherName")?.value.trim();
  const schoolId = document.getElementById("teacherId")?.value.trim();

  if (!name || !schoolId) {
    showMessage("teacherMessage", "Please fill in all fields.", true);
    return;
  }

  try {
    await DB.addRecord("teachers", { name, schoolId });
    document.getElementById("teacherName").value = "";
    document.getElementById("teacherId").value = "";
    showMessage("teacherMessage", "Teacher added successfully.");
    await loadRecords("teachers", "teacherList");
  } catch (error) {
    console.error(error);
    showMessage("teacherMessage", error.message, true);
  }
}

async function addClass() {
  const name = document.getElementById("className")?.value.trim();

  if (!name) {
    showMessage("classMessage", "Please enter class name.", true);
    return;
  }

  try {
    await DB.addRecord("classes", { name });
    document.getElementById("className").value = "";
    showMessage("classMessage", "Class added successfully.");
    await loadRecords("classes", "classList");
  } catch (error) {
    console.error(error);
    showMessage("classMessage", error.message, true);
  }
}

async function deleteItem(collectionName, id) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  try {
    await DB.deleteRecord(collectionName, id);
    if (collectionName === "students") {
      await loadRecords("students", "studentList");
    } else if (collectionName === "teachers") {
      await loadRecords("teachers", "teacherList");
    } else if (collectionName === "classes") {
      await loadRecords("classes", "classList");
    }
    await loadDashboard();
  } catch (error) {
    console.error(error);
    alert("Could not delete record: " + error.message);
  }
}

async function loadDashboard() {
  try {
    const students = await DB.getRecords("students");
    const teachers = await DB.getRecords("teachers");
    const classes = await DB.getRecords("classes");

    const studentCount = document.getElementById("studentCount");
    const teacherCount = document.getElementById("teacherCount");
    const classCount = document.getElementById("classCount");

    if (studentCount) studentCount.textContent = students.length;
    if (teacherCount) teacherCount.textContent = teachers.length;
    if (classCount) classCount.textContent = classes.length;
  } catch (error) {
    console.error(error);
  }
}

function showPage(page, button) {
  if (!content || !pages[page]) return;

  content.innerHTML = pages[page];

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");

  if (page === "students") loadRecords("students", "studentList");
  if (page === "teachers") loadRecords("teachers", "teacherList");
  if (page === "classes") loadRecords("classes", "classList");
  if (page === "dashboard") loadDashboard();
}

window.showPage = showPage;
window.addStudent = addStudent;
window.addTeacher = addTeacher;
window.addClass = addClass;
window.deleteItem = deleteItem;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});
