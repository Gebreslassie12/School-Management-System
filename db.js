
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

// Collections allowed for each school
const allowedCollections = [
  "students",
  "teachers",
  "classes",
  "attendance",
  "results",
  "performance"
];

// Get the signed-in school's collection
function getSchoolCollection(collectionName) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!allowedCollections.includes(collectionName)) {
    throw new Error("Invalid collection name.");
  }

  return collection(
    db,
    "schools",
    user.uid,
    collectionName
  );
}

// Add a new record
export async function addRecord(collectionName, data) {
  return await addDoc(
    getSchoolCollection(collectionName),
    {
      ...data,
      createdAt: serverTimestamp()
    }
  );
}

// Get all records
export async function getRecords(collectionName) {
  const snapshot = await getDocs(
    getSchoolCollection(collectionName)
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

// Update a record
export async function updateRecord(collectionName, id, data) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!allowedCollections.includes(collectionName)) {
    throw new Error("Invalid collection name.");
  }

  const reference = doc(
    db,
    "schools",
    user.uid,
    collectionName,
    id
  );

  return await updateDoc(reference, data);
}

// Delete a record
export async function deleteRecord(collectionName, id) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!allowedCollections.includes(collectionName)) {
    throw new Error("Invalid collection name.");
  }

  const reference = doc(
    db,
    "schools",
    user.uid,
    collectionName,
    id
  );

  return await deleteDoc(reference);
}

// Find records by field
export async function findRecords(collectionName, field, value) {
  const q = query(
    getSchoolCollection(collectionName),
    where(field, "==", value)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}
