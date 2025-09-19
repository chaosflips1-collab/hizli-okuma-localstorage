// src/components/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export default function AdminPanel() {
  const [codes, setCodes] = useState([]);

  // Kodları Firestore'dan çek
  const fetchCodes = async () => {
    const q = query(collection(db, "codes"), orderBy("code", "asc"));
    const snapshot = await getDocs(q);
    setCodes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // Yeni kod üret
  const generateNewCode = async () => {
    let maxNumber = 0;
    codes.forEach((c) => {
      const match = c.code.match(/ogr(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const newNumber = (maxNumber + 1).toString().padStart(4, "0");
    const newCode = `ogr${newNumber}`;

    await addDoc(collection(db, "codes"), {
      code: newCode,
      lockedTo: null,
      createdAt: new Date(),
    });

    fetchCodes();
  };

  // Öğrenciyi sil (students koleksiyonundan)
  const removeStudent = async (lockedTo) => {
    if (!lockedTo) return;
    const q = query(
      collection(db, "students"),
      where("code", "==", lockedTo.code),
      where("name", "==", lockedTo.name),
      where("surname", "==", lockedTo.surname),
      where("className", "==", lockedTo.className)
    );
    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "students", docSnap.id));
    });
  };

  // Resetle → kod boşalır + öğrenci silinir
  const resetCode = async (id, lockedTo) => {
    const ref = doc(db, "codes", id);
    await updateDoc(ref, { lockedTo: null });
    await removeStudent(lockedTo);
    fetchCodes();
  };

  // Sil → kod tamamen silinir + öğrenci silinir
  const deleteCode = async (id, lockedTo) => {
    await removeStudent(lockedTo);
    const ref = doc(db, "codes", id);
    await deleteDoc(ref);
    fetchCodes();
  };

  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #fff1c1, #ffb997)",
        fontFamily: "'Comic Sans MS', Arial, sans-serif",
        padding: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>📋 Kod Listesi</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        {codes.map((c) => (
          <div
            key={c.id}
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {c.code}{" "}
              {c.lockedTo ? (
                <span style={{ color: "red" }}>
                  🔒 {c.lockedTo.name} {c.lockedTo.surname} (
                  {c.lockedTo.className})
                </span>
              ) : (
                <span style={{ color: "green" }}>(Boş)</span>
              )}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => resetCode(c.id, c.lockedTo)}
                style={{
                  backgroundColor: "orange",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ♻ Resetle
              </button>
              <button
                onClick={() => deleteCode(c.id, c.lockedTo)}
                style={{
                  backgroundColor: "red",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ❌ Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={generateNewCode}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "green",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        ➕ Yeni Kod Üret
      </button>
    </div>
  );
}
