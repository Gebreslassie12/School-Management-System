
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase.js";

const allowedCollections = [
  "students",
  "teachers",
  "classes",
  "attendance",
  "results",
  "performance"
];

function getSchoolCollection(name) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!allowedCollections.includes(name)) {
    throw new Error("Invalid collection name.");
  }

  return collection(db, "schools", user.uid, name);
}

function getSchoolDocument(name, id) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!allowedCollections.includes(name)) {
    throw new Error("Invalid collection name.");
  }

  return doc(db, "schools", user.uid, name, id);
}

export async function addRecord(name, data) {
  return await addDoc(getSchoolCollection(name), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getRecords(name) {
  const snapshot = await getDocs(getSchoolCollection(name));

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

export async function updateRecord(name, id, data) {
  return await updateDoc(
    getSchoolDocument(name, id),
    data
  );
}

export async function deleteRecord(name, id) {
  return await deleteDoc(
    getSchoolDocument(name, id)
  );
}

export async function findRecords(name, field, value) {
  const q = query(
    getSchoolCollection(name),
    where(field, "==", value)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}
