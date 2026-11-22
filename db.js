
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { db } from "./firebase.js";

export async function addRecord(collectionName, data) {
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString()
  });
}

export async function getRecords(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}

export async function updateRecord(collectionName, id, data) {
  const reference = doc(db, collectionName, id);
  return await updateDoc(reference, data);
}

export async function deleteRecord(collectionName, id) {
  const reference = doc(db, collectionName, id);
  return await deleteDoc(reference);
}

export async function findRecords(collectionName, field, value) {
  const q = query(
    collection(db, collectionName),
    where(field, "==", value)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}
