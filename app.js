import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

import {
  addRecord,
  getRecords,
  deleteRecord
} from "./db.js";

const $ = selector => document.querySelector(selector);

let currentUser = null;
let attendanceSaving = false;

const pages = {
  dashboard: `
    <h2>Dashboard</h2>
    <div class="cards">
      <div class="card">
        <h3>Students</h3>
        <div class="number" id="studentCount">0</div>
      </div>
      <div class="card">
        <h3>Teachers</h3>
        <div class="number" id="teacherCount">0</div>
      </div>
      <div class="card">
        <h3>Classes</h3>
        <div class="number" id="classCount">0</div>
      </div>
    </div>
    <div class="panel">
      <h3>Welcome</h3>
      <p>Welcome to School Management System.</p>
    </div>
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
      <h3>Record Attendance</h3>

      <label for="attendanceType">Attendance for</label>
      <select id="attendanceType" onchange="loadAttendanceNames()">
        <option value="students">Students</option>
        <option value="teachers">Teachers</option>
      </select>

      <label for="attendancePerson">Name</label>
      <select id="attendancePerson">
        <option value="">Loading names...</option>
      </select>

      <label for="attendanceDate">Date</label>
      <input type="date" id="attendanceDate">

      <label for="attendanceStatus">Status</label>
      <select id="attendanceStatus">
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Late">Late</option>
      </select>

      <button id="saveAttendanceButton" onclick="saveAttendance()">
        Save Attendance
      </button>

      <p id="attendanceMessage"></p>
      <div id="attendanceList"></div>
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
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  if (page === "attendance") {
    $("#attendanceDate").value = getLocalDate();
    loadAttendanceNames();
    loadAttendanceRecords();
  }
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
        <button onclick="removeRecord('${record.id}', '${collectionName}')">
          Delete
        </button>
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
    return false;
  }

  try {
    await addRecord(collectionName, {
      name: name.trim(),
      code: code.trim()
    });

    message.textContent = "Saved successfully!";
    await reloadFunction();
    await loadDashboard();

    return true;

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;
    return false;
  }
}

async function addStudent() {
  const saved = await saveRecord(
    "students",
    $("#studentName").value,
    $("#studentId").value,
    "studentMessage",
    loadStudents
  );

  if (saved) {
    $("#studentName").value = "";
    $("#studentId").value = "";
  }
}

async function addTeacher() {
  const saved = await saveRecord(
    "teachers",
    $("#teacherName").value,
    $("#teacherId").value,
    "teacherMessage",
    loadTeachers
  );

  if (saved) {
    $("#teacherName").value = "";
    $("#teacherId").value = "";
  }
}

async function addClass() {
  const saved = await saveRecord(
    "classes",
    $("#className").value,
    "",
    "classMessage",
    loadClasses
  );

  if (saved) {
    $("#className").value = "";
  }
}

async function loadAttendanceNames() {
  const type = $("#attendanceType")?.value;
  const select = $("#attendancePerson");

  if (!type || !select) return;

  select.innerHTML = `<option value="">Loading...</option>`;

  try {
    const people = await getRecords(type);

    if (people.length === 0) {
      select.innerHTML = `<option value="">No names found. Register first.</option>`;
      return;
    }

    select.innerHTML = `
      <option value="">Select a name</option>
      ${people.map(person => `
        <option value="${escapeHTML(person.id)}"
          data-name="${escapeHTML(person.name)}"
          data-code="${escapeHTML(person.code || "")}">
          ${escapeHTML(person.name)}${person.code ? " — " + escapeHTML(person.code) : ""}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
    select.innerHTML = `<option value="">Could not load names.</option>`;
  }
}

async function saveAttendance() {
  if (attendanceSaving) return;

  const type = $("#attendanceType").value;
  const personSelect = $("#attendancePerson");
  const selectedOption = personSelect.options[personSelect.selectedIndex];
  const personId = personSelect.value;
  const personName = selectedOption?.dataset.name || "";
  const personCode = selectedOption?.dataset.code || "";
  const date = $("#attendanceDate").value;
  const status = $("#attendanceStatus").value;
  const message = $("#attendanceMessage");
  const button = $("#saveAttendanceButton");

  if (!personId) {
    message.textContent = "Please select a student or teacher.";
    return;
  }

  if (!date) {
    message.textContent = "Please select a date.";
    return;
  }

  attendanceSaving = true;
  button.disabled = true;
  button.textContent = "Saving...";

  try {
    await addRecord("attendance", {
      personId,
      name: personName,
      code: personCode,
      personType: type,
      date,
      status
    });

    message.textContent = "Attendance saved successfully!";
    await loadAttendanceRecords();

  } catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;

  } finally {
    attendanceSaving = false;
    button.disabled = false;
    button.textContent = "Save Attendance";
  }
}

async function loadAttendanceRecords() {
  const element = $("#attendanceList");
  if (!element) return;

  element.textContent = "Loading attendance...";

  try {
    const records = await getRecords("attendance");

    if (records.length === 0) {
      element.innerHTML = "<p>No attendance records found.</p>";
      return;
    }

    records.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    element.innerHTML = `
      <h3>Attendance Records</h3>
      ${records.map(record => `
        <div class="panel">
          <strong>${escapeHTML(record.name)}</strong>
          <p>
            ${escapeHTML(record.personType === "teachers" ? "Teacher" : "Student")}
            ${record.code ? " — " + escapeHTML(record.code) : ""}
          </p>
          <p>Date: ${escapeHTML(record.date)}</p>
          <p>Status: ${escapeHTML(record.status)}</p>
          <button onclick="removeRecord('${record.id}', 'attendance')">
            Delete
          </button>
        </div>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);
    element.textContent = "Unable to load attendance records.";
  }
}

async function removeRecord(id, collectionName) {
  const confirmed = confirm(
    "Are you sure you want to delete this record?"
  );

  if (!confirmed) return;

  try {
    await deleteRecord(collectionName, id);

    if (collectionName === "students") await loadStudents();
    if (collectionName === "teachers") await loadTeachers();
    if (collectionName === "classes") await loadClasses();
    if (collectionName === "attendance") await loadAttendanceRecords();

    await loadDashboard();

  } catch (error) {
    console.error(error);
    alert("Unable to delete record: " + error.message);
  }
}

window.showPage = showPage;
window.addStudent = addStudent;
window.addTeacher = addTeacher;
window.addClass = addClass;
window.removeRecord = removeRecord;
window.loadAttendanceNames = loadAttendanceNames;
window.saveAttendance = saveAttendance;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUser = user;

  const firstButton = document.querySelector("nav button");
  showPage("dashboard", firstButton);
});