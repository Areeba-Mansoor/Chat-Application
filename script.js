import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import{ getDatabase, ref, push, set, remove, update, onChildAdded, onChildChanged, get} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDZJb52Xr9o1yiSwJ8UB0b_uvqfsQJ7jgc",
    authDomain: "real-time-database-e3f8d.firebaseapp.com",
    databaseURL: "https://real-time-database-e3f8d-default-rtdb.firebaseio.com",
    projectId: "real-time-database-e3f8d",
    storageBucket: "real-time-database-e3f8d.firebasestorage.app",
    messagingSenderId: "1046423366416",
    appId: "1:1046423366416:web:ba44324a77cd8faa711395",
    measurementId: "G-29X722CZT1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// SignUp
document.getElementById("signupBtn")?.addEventListener("click", () => {
    const signupEmail = document.getElementById("signupEmail").value;
    const signupPassword = document.getElementById("signupPassword").value;
    console.log(signupEmail, signupPassword);

    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
        .then(() => {
            Swal.fire({
                title: "SigUp",
                text: "You Signup Scessfully ChatDong",
                icon: "success",
            });
            window.location.href = "user.html";
        })
        .catch((error) => {
            Swal.fire("Error Msssage: " + error.message);
        });
});

// Login
document.getElementById("loginBtn")?.addEventListener("click", () => {
    const loginEmail = document.getElementById("loginEmail").value;
    const loginPassword = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then(() => {
            Swal.fire({
                title: "Login!",
                text: "You login Successfully chatDong!",
                icon: "success",
            });
            window.location.href = "user.html";
        })
        .catch((error) => {
            Swal.fire("Error Msssage: " + error.message);
        });
});

//Continue with google
document.getElementById("google-btn")?.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then(() => {
            swal({
                title: "Login!",
                text: "You login Successfully chatDong!",
                icon: "success",
                button: "Done!",
            });
            window.location.href = "user.html";
        })
        .catch((error) => {
             swal("Error!", "Error Message: " + error.message, "error");
        });
});

//Lgout
document.getElementById("logoutBtn")?.addEventListener("click", () => {

    signOut(auth)
        .then(() => {
            swal({
                title: "Logout!",
                text: "You have logged out from ChatDong!!",
                icon: "success",
                button: "Done!",
            });
            window.location.href = "index.html";
        })
        .catch((error) => {
             swal("Error!", "Error Message: " + error.message, "error");
        });
});

//Enter chat function
window.enterChat = function () {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Please enter a username");

    localStorage.setItem("username", username);
    window.location.href = "chat.html";
};

if (!localStorage.getItem("username")) {
  localStorage.setItem("username", prompt("Enter username:", "Guest") || "Guest");
}
const currentUser = () => localStorage.getItem("username");

/* ✅ Send Message */
window.messageSend = function () {
  const input = document.getElementById("message");
  const message = input.value.trim();
  const username = currentUser();
  if (!message) return;

  const newMsgRef = push(ref(db, "messages"));
  set(newMsgRef, {
    username,
    message,
    timestamp: Date.now(),
    reactions: {}
  }).then(() => input.value = "")
    .catch((err) => alert("Error: " + err.message));
};

/* Enter to send */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("message");
  const sendBtn = document.getElementById("sendBtn");
  input.addEventListener("keypress", (e) => { if (e.key === "Enter") messageSend(); });
  sendBtn.addEventListener("click", messageSend);
});

/* ✅ Delete Message */
function deleteMessage(id, el) {
  remove(ref(db, `messages/${id}`)).then(() => el.remove());
}

/* ✅ Edit Message */
function editMessage(id, el, oldText) {
  const newText = prompt("Edit message:", oldText);
  if (newText && newText.trim() !== "") {
    update(ref(db, `messages/${id}`), { message: newText, edited: true });
  }
}

/* ✅ Add Reaction */
// function addReaction(id, emoji, username) {
//   const emojiRef = ref(db, `messages/${id}/reactions/${encodeEmoji(emoji)}`);
//   get(emojiRef).then(snap => {
//     let arr = snap.exists() ? snap.val() : [];
//     if (!Array.isArray(arr)) arr = Object.values(arr);
//     if (arr.includes(username)) arr = arr.filter(u => u !== username);
//     else arr.push(username);
//     set(emojiRef, arr);
//   });
// }
// function encodeEmoji(e) { return Array.from(e).map(ch => ch.charCodeAt(0)).join('-'); }
// function decodeEmoji(k) { return k.split('-').map(c => String.fromCharCode(c)).join(''); }

/* ✅ Render messages */
const chatBox = document.getElementById("chat-box");
const msgMap = {};

onChildAdded(ref(db, "messages"), snap => {
  renderMessage(snap.key, snap.val());
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
});
onChildChanged(ref(db, "messages"), snap => renderMessage(snap.key, snap.val()));

function renderMessage(id, data) {
  const fromMe = data.username === currentUser();
  let container = msgMap[id];

  if (!container) {
    container = document.createElement("div");
    container.className = `message-container ${fromMe ? "sent" : "received"}`;
    container.dataset.messageId = id;

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = (data.username || "U")[0].toUpperCase();

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("div");
    name.className = "username";

    const msgText = document.createElement("div");
    msgText.className = "message-text";

    const time = document.createElement("div");
    time.className = "message-time";

    const reactDisplay = document.createElement("div");
    reactDisplay.className = "reaction-display";

    const reactBar = document.createElement("div");
    reactBar.className = "reaction-bar";

    const btns = document.createElement("div");
    btns.className = "btn-container";
    if (fromMe) {
      const edit = document.createElement("span");
      edit.textContent = "✏️";
      edit.addEventListener("click", () => editMessage(id, container, data.message));
      const del = document.createElement("span");
      del.textContent = "🗑️";
      del.addEventListener("click", () => {
        if (confirm("Delete this message?")) deleteMessage(id, container);
      });
      btns.append(edit, del);
    }

    content.append(name, msgText, time, reactDisplay, reactBar, btns);
    container.append(avatar, content);
    chatBox.appendChild(container);
    msgMap[id] = container;
  }

  container.querySelector(".username").textContent = data.username;
  container.querySelector(".message-text").textContent = data.message;
  container.querySelector(".message-time").textContent =
    new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    (data.edited ? " • edited" : "");

  const rd = container.querySelector(".reaction-display");
  rd.innerHTML = "";
  if (data.reactions) {
    for (const key in data.reactions) {
      const users = data.reactions[key];
      if (users.length) {
        const emoji = decodeEmoji(key);
        const span = document.createElement("span");
        span.textContent = `${emoji} ${users.length}`;
        if (users.includes(currentUser())) span.style.background = "rgba(255,255,255,0.12)";
        rd.appendChild(span);
      }
    }
  }
}
