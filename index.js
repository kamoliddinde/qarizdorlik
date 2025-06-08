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
      const id = docSnap.id;
      const div = document.createElement('div');
      div.className = 'border p-2 rounded-xl flex justify-between items-center';
      div.innerHTML = `
        <span>
          <b>${debt.name}</b> | ${debt.phone} | ${debt.eggType} | ${debt.eggCount} ta | ${debt.eggPrice} so'm | ${debt.amount} so'm
        </span>
        <div id="actions-${id}" class="mt-4">
          <div class="relative">
            <button onclick="toggleActionsMenu('${id}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-lg font-bold w-full flex items-center justify-center gap-2">
              O'zgartirishlar
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="actions-menu-${id}" class="actions-menu absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 hidden">
              <button onclick="showAddModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Qo'shish</button>
              <button onclick="showSubtractModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayirish</button>
              <button onclick="showEditModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tahrirlash</button>
              <button onclick="showDeleteConfirm('${id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">O'chirish</button>
              <button onclick="showHistory('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tarix</button>
            </div>
          </div>
        </div>
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
function toggleActionsMenu(id) {
  const menu = document.getElementById(`actions-menu-${id}`);
  // Barcha boshqa menyularni yopish
  document.querySelectorAll('.actions-menu').forEach(m => {
    if (m.id !== `actions-menu-${id}`) {
      m.classList.add('hidden');
    }
  });
  // Tanlangan menyuni ochish/yopish
  menu.classList.toggle('hidden');
}

// Sahifada bo'sh joyga bosganda menyularni yopish
document.addEventListener('click', function(event) {
  if (!event.target.closest('.relative')) {
    document.querySelectorAll('.actions-menu').forEach(menu => {
      menu.classList.add('hidden');
    });
  }
});
function toggleActionsMenu(id) {
  const menu = document.getElementById(`actions-menu-${id}`);
  menu.classList.toggle('hidden');
}


  function displayDebts() {
  const listDiv = document.getElementById('debtList');
  const search = (document.getElementById('searchInput')?.value || "").toLowerCase();
  listDiv.innerHTML = "";
  for (const [id, data] of Object.entries(debts)) {
    if (search && !data.name.toLowerCase().includes(search)) continue;
    const eggSum = (data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0;
    const total = (data.amount || 0) + eggSum;

    listDiv.innerHTML += `
      <div id="card-${id}" class="bg-white border p-6 rounded-xl shadow relative text-lg flex flex-col gap-2 transition-all">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-2xl font-bold">${data.name}</h3>
          <button onclick="showProfile('${id}')" class="bg-blue-500 text-white px-4 py-2 rounded-xl text-base font-bold">Profile</button>
        </div>
        <p class="font-bold">Umumiy qarz: <span class="text-purple-700">${total} so'm</span></p>
        <div id="details-${id}" style="display:none;" class="mt-2 mb-2 text-base">
          <p><b>Pul qarzi:</b> ${data.amount || 0} so'm</p>
          <p><b>Tuxum soni:</b> ${data.eggs || 0} ta</p>
          <p><b>Tuxum narxi:</b> ${data.eggPrice || 0} so'm</p>
          <p><b>Jami tuxum summasi:</b> ${(data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0} so'm</p>
          <p><b>Tuxum turi:</b> ${data.eggType || ""}</p>
          <p><b>Telefon:</b> ${data.phone || ""}</p>
        </div>
        <div id="actions-${id}" style="display:none;" class="mt-4">
          <div class="relative">
            <button onclick="toggleActionsMenu('${id}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-lg font-bold w-full flex items-center justify-center gap-2">
              O'zgartirishlar
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="actions-menu-${id}" class="actions-menu absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 hidden">
              <button onclick="showAddModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Qo'shish</button>
              <button onclick="showSubtractModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayirish</button>
              <button onclick="showEditModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tahrirlash</button>
              <button onclick="showDeleteConfirm('${id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">O'chirish</button>
              <button onclick="showHistory('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tarix</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
function toggleEditActions(id) {
  editId = id;
  const container = document.getElementById('edit-actions-' + id);
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function addValues() {
  if (addDisabled) return;
  addDisabled = true;
  const addBtn = document.querySelector('#addModal button[onclick="addValues()"]');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    addDisabled = false;
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const addAmount = parseFloat(document.getElementById('addAmount').value) || 0;
  const addEggs = parseInt(document.getElementById('addEggs').value) || 0;
  const addEggPrice = parseFloat(document.getElementById('addEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = (data.amount || 0) + addAmount;
    const updatedEggs = (data.eggs || 0) + addEggs;
    const updatedEggPrice = addEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (addAmount) action.push(`Pul: +${addAmount}`);
    if (addEggs) action.push(`Tuxum: +${addEggs}`);
    if (addEggPrice) action.push(`Tuxum narxi: +${addEggPrice}`);
    newHistory.push({ date: dateStr, action: "Qo‘shildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('addModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

function subtractValues() {
  if (subtractDisabled) return;
  subtractDisabled = true;
  const subBtn = document.querySelector('#subtractModal button[onclick="subtractValues()"]');
  if (subBtn) {
    subBtn.disabled = true;
    subBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    subtractDisabled = false;
    if (subBtn) {
      subBtn.disabled = false;
      subBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const subAmount = parseFloat(document.getElementById('subtractAmount').value) || 0;
  const subEggs = parseInt(document.getElementById('subtractEggs').value) || 0;
  const subEggPrice = parseFloat(document.getElementById('subtractEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = Math.max(0, (data.amount || 0) - subAmount);
    const updatedEggs = Math.max(0, (data.eggs || 0) - subEggs);
    const updatedEggPrice = subEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (subAmount) action.push(`Pul: -${subAmount}`);
    if (subEggs) action.push(`Tuxum: -${subEggs}`);
    if (subEggPrice) action.push(`Tuxum narxi: -${subEggPrice}`);
    newHistory.push({ date: dateStr, action: "Ayirildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('subtractModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}


function displayDebts() {
  const listDiv = document.getElementById('debtList');
  const search = (document.getElementById('searchInput')?.value || "").toLowerCase();
  listDiv.innerHTML = "";
  for (const [id, data] of Object.entries(debts)) {
    if (search && !data.name.toLowerCase().includes(search)) continue;
    const eggSum = (data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0;
    const total = (data.amount || 0) + eggSum;

    listDiv.innerHTML += `
      <div id="card-${id}" class="bg-white border p-6 rounded-xl shadow relative text-lg flex flex-col gap-2 transition-all">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-2xl font-bold">${data.name}</h3>
          <button onclick="showProfile('${id}')" class="bg-blue-500 text-white px-4 py-2 rounded-xl text-base font-bold">Profile</button>
        </div>
        <p class="font-bold">Umumiy qarz: <span class="text-purple-700">${total} so'm</span></p>
        <div id="details-${id}" style="display:none;" class="mt-2 mb-2 text-base">
          <p><b>Pul qarzi:</b> ${data.amount || 0} so'm</p>
          <p><b>Tuxum soni:</b> ${data.eggs || 0} ta</p>
          <p><b>Tuxum narxi:</b> ${data.eggPrice || 0} so'm</p>
          <p><b>Jami tuxum summasi:</b> ${(data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0} so'm</p>
          <p><b>Tuxum turi:</b> ${data.eggType || ""}</p>
          <p><b>Telefon:</b> ${data.phone || ""}</p>
        </div>
        <div id="actions-${id}" style="display:none;" class="mt-4">
          <div class="relative">
            <button onclick="toggleActionsMenu('${id}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-lg font-bold w-full flex items-center justify-center gap-2">
              O'zgartirishlar
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="actions-menu-${id}" class="actions-menu absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 hidden">
              <button onclick="showAddModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Qo'shish</button>
              <button onclick="showSubtractModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayirish</button>
              <button onclick="showEditModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tahrirlash</button>
              <button onclick="showDeleteConfirm('${id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">O'chirish</button>
              <button onclick="showHistory('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tarix</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
function toggleEditActions(id) {
  editId = id;
  const container = document.getElementById('edit-actions-' + id);
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function addValues() {
  if (addDisabled) return;
  addDisabled = true;
  const addBtn = document.querySelector('#addModal button[onclick="addValues()"]');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    addDisabled = false;
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const addAmount = parseFloat(document.getElementById('addAmount').value) || 0;
  const addEggs = parseInt(document.getElementById('addEggs').value) || 0;
  const addEggPrice = parseFloat(document.getElementById('addEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = (data.amount || 0) + addAmount;
    const updatedEggs = (data.eggs || 0) + addEggs;
    const updatedEggPrice = addEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (addAmount) action.push(`Pul: +${addAmount}`);
    if (addEggs) action.push(`Tuxum: +${addEggs}`);
    if (addEggPrice) action.push(`Tuxum narxi: +${addEggPrice}`);
    newHistory.push({ date: dateStr, action: "Qo‘shildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('addModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

function subtractValues() {
  if (subtractDisabled) return;
  subtractDisabled = true;
  const subBtn = document.querySelector('#subtractModal button[onclick="subtractValues()"]');
  if (subBtn) {
    subBtn.disabled = true;
    subBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    subtractDisabled = false;
    if (subBtn) {
      subBtn.disabled = false;
      subBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const subAmount = parseFloat(document.getElementById('subtractAmount').value) || 0;
  const subEggs = parseInt(document.getElementById('subtractEggs').value) || 0;
  const subEggPrice = parseFloat(document.getElementById('subtractEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = Math.max(0, (data.amount || 0) - subAmount);
    const updatedEggs = Math.max(0, (data.eggs || 0) - subEggs);
    const updatedEggPrice = subEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (subAmount) action.push(`Pul: -${subAmount}`);
    if (subEggs) action.push(`Tuxum: -${subEggs}`);
    if (subEggPrice) action.push(`Tuxum narxi: -${subEggPrice}`);
    newHistory.push({ date: dateStr, action: "Ayirildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('subtractModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

function displayDebts() {
  const listDiv = document.getElementById('debtList');
  const search = (document.getElementById('searchInput')?.value || "").toLowerCase();
  listDiv.innerHTML = "";
  for (const [id, data] of Object.entries(debts)) {
    if (search && !data.name.toLowerCase().includes(search)) continue;
    const eggSum = (data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0;
    const total = (data.amount || 0) + eggSum;

    listDiv.innerHTML += `
      <div id="card-${id}" class="bg-white border p-6 rounded-xl shadow relative text-lg flex flex-col gap-2 transition-all">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-2xl font-bold">${data.name}</h3>
          <button onclick="showProfile('${id}')" class="bg-blue-500 text-white px-4 py-2 rounded-xl text-base font-bold">Profile</button>
        </div>
        <p class="font-bold">Umumiy qarz: <span class="text-purple-700">${total} so'm</span></p>
        <div id="details-${id}" style="display:none;" class="mt-2 mb-2 text-base">
          <p><b>Pul qarzi:</b> ${data.amount || 0} so'm</p>
          <p><b>Tuxum soni:</b> ${data.eggs || 0} ta</p>
          <p><b>Tuxum narxi:</b> ${data.eggPrice || 0} so'm</p>
          <p><b>Jami tuxum summasi:</b> ${(data.eggs && data.eggPrice) ? data.eggs * data.eggPrice : 0} so'm</p>
          <p><b>Tuxum turi:</b> ${data.eggType || ""}</p>
          <p><b>Telefon:</b> ${data.phone || ""}</p>
        </div>
        <div id="actions-${id}" style="display:none;" class="mt-4">
          <div class="relative">
            <button onclick="toggleActionsMenu('${id}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-lg font-bold w-full flex items-center justify-center gap-2">
              O'zgartirishlar
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div id="actions-menu-${id}" class="actions-menu absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 hidden">
              <button onclick="showAddModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Qo'shish</button>
              <button onclick="showSubtractModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayirish</button>
              <button onclick="showEditModal('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tahrirlash</button>
              <button onclick="showDeleteConfirm('${id}')" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">O'chirish</button>
              <button onclick="showHistory('${id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tarix</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
function toggleEditActions(id) {
  editId = id;
  const container = document.getElementById('edit-actions-' + id);
  container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function addValues() {
  if (addDisabled) return;
  addDisabled = true;
  const addBtn = document.querySelector('#addModal button[onclick="addValues()"]');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    addDisabled = false;
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const addAmount = parseFloat(document.getElementById('addAmount').value) || 0;
  const addEggs = parseInt(document.getElementById('addEggs').value) || 0;
  const addEggPrice = parseFloat(document.getElementById('addEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = (data.amount || 0) + addAmount;
    const updatedEggs = (data.eggs || 0) + addEggs;
    const updatedEggPrice = addEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (addAmount) action.push(`Pul: +${addAmount}`);
    if (addEggs) action.push(`Tuxum: +${addEggs}`);
    if (addEggPrice) action.push(`Tuxum narxi: +${addEggPrice}`);
    newHistory.push({ date: dateStr, action: "Qo‘shildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('addModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

function subtractValues() {
  if (subtractDisabled) return;
  subtractDisabled = true;
  const subBtn = document.querySelector('#subtractModal button[onclick="subtractValues()"]');
  if (subBtn) {
    subBtn.disabled = true;
    subBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    subtractDisabled = false;
    if (subBtn) {
      subBtn.disabled = false;
      subBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const subAmount = parseFloat(document.getElementById('subtractAmount').value) || 0;
  const subEggs = parseInt(document.getElementById('subtractEggs').value) || 0;
  const subEggPrice = parseFloat(document.getElementById('subtractEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = Math.max(0, (data.amount || 0) - subAmount);
    const updatedEggs = Math.max(0, (data.eggs || 0) - subEggs);
    const updatedEggPrice = subEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (subAmount) action.push(`Pul: -${subAmount}`);
    if (subEggs) action.push(`Tuxum: -${subEggs}`);
    if (subEggPrice) action.push(`Tuxum narxi: -${subEggPrice}`);
    newHistory.push({ date: dateStr, action: "Ayirildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('subtractModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

let addDisabled = false;
let subtractDisabled = false;

function addValues() {
  if (addDisabled) return;
  addDisabled = true;
  const addBtn = document.querySelector('#addModal button[onclick="addValues()"]');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    addDisabled = false;
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const addAmount = parseFloat(document.getElementById('addAmount').value) || 0;
  const addEggs = parseInt(document.getElementById('addEggs').value) || 0;
  const addEggPrice = parseFloat(document.getElementById('addEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = (data.amount || 0) + addAmount;
    const updatedEggs = (data.eggs || 0) + addEggs;
    const updatedEggPrice = addEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (addAmount) action.push(`Pul: +${addAmount}`);
    if (addEggs) action.push(`Tuxum: +${addEggs}`);
    if (addEggPrice) action.push(`Tuxum narxi: +${addEggPrice}`);
    newHistory.push({ date: dateStr, action: "Qo‘shildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('addModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}

function subtractValues() {
  if (subtractDisabled) return;
  subtractDisabled = true;
  const subBtn = document.querySelector('#subtractModal button[onclick="subtractValues()"]');
  if (subBtn) {
    subBtn.disabled = true;
    subBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  setTimeout(() => {
    subtractDisabled = false;
    if (subBtn) {
      subBtn.disabled = false;
      subBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }, 60000); // 60 sekund

  if (!editId) return;

  const subAmount = parseFloat(document.getElementById('subtractAmount').value) || 0;
  const subEggs = parseInt(document.getElementById('subtractEggs').value) || 0;
  const subEggPrice = parseFloat(document.getElementById('subtractEggPrice')?.value) || 0;
  const now = new Date();
  const dateStr = now.toLocaleString('uz-UZ');

  db.collection('debts').doc(editId).get().then(doc => {
    const data = doc.data();
    if (!data) return;

    const updatedAmount = Math.max(0, (data.amount || 0) - subAmount);
    const updatedEggs = Math.max(0, (data.eggs || 0) - subEggs);
    const updatedEggPrice = subEggPrice || data.eggPrice || 0;

    const newHistory = (data.history || []);
    let action = [];
    if (subAmount) action.push(`Pul: -${subAmount}`);
    if (subEggs) action.push(`Tuxum: -${subEggs}`);
    if (subEggPrice) action.push(`Tuxum narxi: -${subEggPrice}`);
    newHistory.push({ date: dateStr, action: "Ayirildi: " + action.join(", ") });

    db.collection('debts').doc(editId).update({
      amount: updatedAmount,
      eggs: updatedEggs,
      eggPrice: updatedEggPrice,
      history: newHistory
    }).then(() => {
      document.getElementById('subtractModal').style.display = 'none';
      document.getElementById('editModal').style.display = 'none';
      loadDebts();
    });
  });
}
