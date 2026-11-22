const DB_NAME = "SchoolManagementDB";
const DB_VERSION = 1;

let database;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      const stores = [
        "students",
        "teachers",
        "classes",
        "subjects",
        "attendance",
        "results",
        "fees",
        "performance"
      ];

      stores.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, {
            keyPath: "id",
            autoIncrement: true
          });
        }
      });
    };

    request.onsuccess = event => {
      database = event.target.result;
      resolve(database);
    };

    request.onerror = () => reject(request.error);
  });
}

async function saveRecord(storeName, record) {
  const db = database || await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(record);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getRecords(storeName) {
  const db = database || await openDatabase();

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName)
      .objectStore(storeName).getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteRecord(storeName, id) {
  const db = database || await openDatabase();

  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readwrite")
      .objectStore(storeName).delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

openDatabase().catch(error => {
  console.error("Database error:", error);
});
