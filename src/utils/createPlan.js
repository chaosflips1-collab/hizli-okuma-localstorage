// src/utils/createPlan.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 📘 21 Günlük Egzersiz Planı (4 günlük döngü)
 * Day1–Day4 sıralaması sabit, 5. günden itibaren döngü başa döner.
 */

const schedule = {
  day1: ["takistoskop", "kosesel", "acili"],
  day2: ["cifttarafliodak", "harfbulmaodakcalismasi", "odaklanma", "hafizagelistirmecalismasi"],
  day3: ["gozoyunu", "buyuyensekil", "genisleyenkutular"],
  day4: ["blokokuma", "hizliokuma"],
};

export default async function createPlan(className = "5A") {
  try {
    const planRef = doc(db, "plans", className);
    const planData = {};

    // 🔁 21 gün döngü
    for (let i = 1; i <= 21; i++) {
      const patternDay = `day${((i - 1) % 4) + 1}`; // 1–4 arasında dön
      const exercises = schedule[patternDay].map((id) => ({
        id,
        duration: 180, // saniye
      }));

      planData[`day${i}`] = {
        day: i,
        exercises,
      };
    }

    await setDoc(planRef, planData);
    console.log(`✅ ${className} için plan oluşturuldu (döngü aktif)`);
    alert(`✅ ${className} için 21 günlük plan başarıyla oluşturuldu!`);
  } catch (error) {
    console.error("❌ Plan oluşturulamadı:", error);
    alert("⚠️ Plan oluşturulurken bir hata oluştu!");
  }
}
