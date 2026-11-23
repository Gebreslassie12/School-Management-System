
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

import {
  addRecord,
  getRecords
} from "./db.js";

const $ = selector => document.querySelector(selector);

let currentUser = null;

const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card"><h3>Students</h3><div class="number" id="studentCount">0</div></div>
      <div class="card"><h3>Teachers</h3><div class="number" id="teacherCount">0</div></div>
      <div class="card"><h3>Classes</h3><div class="number" id="classCount">0</div></div>
    </div>
    <div class="panel"><h3>Welcome</h3><p>Welcome to School Management System.</p></div>
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

  classes: `
    <h2>Classes & Subjects</h2>
    <div class="panel">
      <h3>Class Management</h3>
      <input id="className" placeholder="Class name (e.g. Grade 9A)">
      <button onclick="addClass()">Add Class</button>
      <p id="classMessage"></p>
      <div id="classList"></div>
    </div>
  `,

  performance: `
    <h2>Teacher Performance</h2>
    <div class="panel">
      <p>Teacher performance evaluation will be developed here.</p>
      <p>Evaluation areas: student progress, syllabus coverage, lesson preparation, punctuality, classroom performance and assessment.</p>
    </div>
  `,

  attendance: `
    <h2>Attendance</h2>
    <div class="panel">
      <p>Student and teacher attendance management will be developed here.</p>
    </div>
  `,

  results: `
    <h2>Exams & Results</h2>
    <div class="panel">
      <p>Examination and student results management will be developed here.</p>
    </div>
  `,

  reports: `
    <h2>Reports</h2>
    <div class="panel">
      <p>School reports will be developed here.</p>
    </div>
  `
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showPage(page, button) {
  if (!pages[page]) return;

  $("#content").innerHTML = pages[page];

  document.querySelectorAll("nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (button) button.classList.add("active");

  if (page === "students") loadStudents();
  if (page === "teachers") loadTeachers();
  if (page === "classes") loadClasses();
  if (page === "dashboard") loadDashboard();
}

async function displayRecords(collectionName, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = "Loading...";

  try {
    const records = await getRecords(collectionName);

    if (records.length === 0) {
      element.innerHTML = "<p>No records found.</p>";
      return;
    }

    element.innerHTML = records.map(record => `
      <div class="panel">
        <strong>${escapeHTML(record.name)}</strong>
        <p>${escapeHTML(record.code || "")}</p>
      </div>
    `).join("");

  } catch (error) {
    console.error(error);
    element.textContent = "Unable to load records.";
  }
}

async function loadStudents() {
  await displayRecords("students", "studentList");
}

async function loadTeachers() {
  await displayRecords("teachers", "teacherList");
}

async function loadClasses() {
  await displayRecords("classes", "classList");
}

async function loadDashboard() {
  try {
    const [students, teachers, classes] = await Promise.all([
      getRecords("students"),
      getRecords("teachers"),
      getRecords("classes")
    ]);

    if ($("#studentCount")) $("#studentCount").textContent = students.length;
    if ($("#teacherCount")) $("#teacherCount").textContent = teachers.length;
    if ($("#classCount")) $("#classCount").textContent = classes.length;

  } catch (error) {
    console.error(error);
  }
}

async function saveRecord(collectionName, name, code, messageId, reloadFunction) {
  const message = document.getElementById(messageId);

  if (!name.trim()) {
    message.textContent = "Please enter a name.";
    return;
  }

  try {
    await addRecord(collectionName, {
      name: name.trim(),
      code: code.trim()
    });

    message.textContent = "Saved successfully!";

    await reloadFunction();

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;
  }
}

async function addStudent() {
  await saveRecord(
    "students",
    $("#studentName").value,
    $("#studentId").value,
    "studentMessage",
    loadStudents
  );

  $("#studentName").value = "";
  $("#studentId").value = "";
}

async function addTeacher() {
  await saveRecord(
    "teachers",
    $("#teacherName").value,
    $("#teacherId").value,
    "teacherMessage",
    loadTeachers
  );

  $("#teacherName").value = "";
  $("#teacherId").value = "";
}

async function addClass() {
  await saveRecord(
    "classes",
    $("#className").value,
    "",
    "classMessage",
    loadClasses
  );

  $("#className").value = "";
}

window.showPage = showPage;
window.addStudent = addStudent;
window.addTeacher = addTeacher;
window.addClass = addClass;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUser = user;

  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});
