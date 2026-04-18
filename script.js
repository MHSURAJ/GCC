import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAMpnV2rL3JhT6bkdVkxjGv2HcjH52hRjk",
  authDomain: "gurukrupa-coaching-classes.firebaseapp.com",
  projectId: "gurukrupa-coaching-classes",
  storageBucket: "gurukrupa-coaching-classes.firebasestorage.app",
  messagingSenderId: "538902096473",
  appId: "1:538902096473:web:5f7ddac5a5b023c3d59f48"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// LOGIN
async function login() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const ref = doc(db, "users", userCred.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("No role assigned!");
      return;
    }

    const role = snap.data().role;

    if (role === "admin") {
      location.href = "dashboard-admin.html";
    } else if (role === "teacher") {
      location.href = "dashboard-teacher.html";
    } else {
      location.href = "dashboard-student.html";
    }

  } catch (e) {
    document.getElementById("error").innerText = "Login Failed";
    console.error(e);
  }
}

// LOGOUT
function logout() {
  signOut(auth);
  location.href = "index.html";
}

// ADD STUDENT
async function addStudent() {
  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const cls = document.getElementById("class").value;

  await addDoc(collection(db, "students"), {
    name,
    roll,
    class: cls,
    marks: Math.floor(Math.random() * 100)
  });

  loadStudents();
}

// LOAD STUDENTS
async function loadStudents() {
  const list = document.getElementById("studentList");
  if (!list) return;

  list.innerHTML = "";

  const data = await getDocs(collection(db, "students"));
  let marks = [];

  data.forEach(d => {
    const s = d.data();
    marks.push(s.marks);

    list.innerHTML += `<li>${s.name} - ${s.marks}</li>`;
  });

  drawChart(marks);
}

// STUDENT VIEW
async function loadStudentData(user) {
  const div = document.getElementById("studentData");
  if (!div) return;

  const data = await getDocs(collection(db, "students"));

  data.forEach(d => {
    const s = d.data();

    if (user.email.includes(s.name.toLowerCase())) {
      div.innerHTML = `<h3>${s.name}</h3><p>Marks: ${s.marks}</p>`;
    }
  });
}

// CHART
function drawChart(data) {
  const ctx = document.getElementById("chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((_, i) => "S" + (i + 1)),
      datasets: [{ label: "Marks", data }]
    }
  });
}

// AUTH STATE
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const role = snap.data().role;

  if (role === "student") {
    loadStudentData(user);
  } else {
    loadStudents();
  }
});

// BUTTON EVENTS
document.getElementById("loginBtn")?.addEventListener("click", login);
document.getElementById("logoutBtn")?.addEventListener("click", logout);
document.getElementById("addBtn")?.addEventListener("click", addStudent);