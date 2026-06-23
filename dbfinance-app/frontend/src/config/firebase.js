import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase Web App Anda
const firebaseConfig = {
  apiKey: "AIzaSyAiyC8AiHTcDjLFVGj7imNeG_KiQAdIGqQ",
  authDomain: "dbfinance-app.firebaseapp.com",
  projectId: "dbfinance-app",
  storageBucket: "dbfinance-app.firebasestorage.com",
  messagingSenderId: "30446112797",
  appId: "1:30446112797:web:5069082c4c4e2d310636f4",
  measurementId: "G-M3ZJWLGELT"
};

// 1. Inisialisasi Aplikasi Firebase
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Firestore Database dan Ekspor agar bisa di-import oleh halaman lain
export const db = getFirestore(app);