import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgb0G3chiVfdzRXLaIqPV5R2Hx5Un3S0g",
  authDomain: "e-qarizdorlik.firebaseapp.com",
  projectId: "e-qarizdorlik",
  storageBucket: "e-qarizdorlik.appspot.com",
  messagingSenderId: "975301245533",
  appId: "1:975301245533:web:436f9a6c3afc50fe756bb4",
  measurementId: "G-GY758MJ2W9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI elementlar
const authSection = document.getElementById('authSection');
const mainSection = document.getElementById('mainSection');
const authMsg = document.getElementById('authMsg');

// Auth: Kirish
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  authMsg.textContent = "";
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Kirish muvaffaqiyatli
      authMsg.textContent = "";
    })
    .catch(e => {
      authMsg.textContent = e.message;
    });
}

// Auth: Ro‘yxatdan o‘tish
function register() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById('authMsg').textContent = '';
    })
    .catch(e => {
      document.getElementById('authMsg').textContent = e.message;
    });
}

// Auth: Chiqish
function logout() {
  signOut(auth);
}

// Auth holatini kuzatish
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.style.display = 'none';
    mainSection.style.display = '';
    loadDebts();
  } else {
    authSection.style.display = '';
    mainSection.style.display = 'none';
  }
});

// Qarzdorlarni yuklash
function loadDebts() {
  const q = query(
    collection(db, "debts"),
    where("uid", "==", auth.currentUser.uid)
  );
  onSnapshot(q, snapshot => {
    const debtList = document.getElementById('debtList');
    debtList.innerHTML = '';
    snapshot.forEach(docSnap => {
      const debt = docSnap.data();
      const div = document.createElement('div');
      div.className = 'border p-2 rounded-xl flex justify-between items-center';
      div.innerHTML = `
        <span>
          <b>${debt.name}</b> | ${debt.phone} | ${debt.eggType} | ${debt.eggCount} ta | ${debt.eggPrice} so'm | ${debt.amount} so'm
        </span>
        <button onclick="removeDebt('${docSnap.id}')" class="text-red-600">O'chirish</button>
      `;
      debtList.appendChild(div);
    });
  });
}

// Qarzdor qo‘shish
function addDebt() {
  const name = document.getElementById('nameInput').value.trim();
  const amount = document.getElementById('amountInput').value.trim();
  const eggCount = document.getElementById('eggInput').value.trim();
  const eggPrice = document.getElementById('eggPriceInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();
  const eggType = document.getElementById('eggType').value.trim();
  if (!name || !phone) {
    alert("Ism va telefon majburiy!");
    return;
  }
  addDoc(collection(db, "debts"), {
    uid: auth.currentUser.uid,
    name,
    amount,
    eggCount,
    eggPrice,
    phone,
    eggType,
    created: serverTimestamp()
  }).then(() => {
    document.getElementById('nameInput').value = '';
    document.getElementById('amountInput').value = '';
    document.getElementById('eggInput').value = '';
    document.getElementById('eggPriceInput').value = '';
    document.getElementById('phoneInput').value = '';
    document.getElementById('eggType').value = '';
  });
}

// Qarzdorni o‘chirish
function removeDebt(id) {
  deleteDoc(doc(db, "debts", id));
}


