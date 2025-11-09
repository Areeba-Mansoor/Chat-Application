

if (!localStorage.getItem("username")) {
  localStorage.setItem("username", prompt("Enter your username:") || "Guest");
}
const currentUser = () => localStorage.getItem("username");

// 🔹 Elements
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

// 🔹 Send message function
function messageSend() {
  const text = input.value.trim();
  if (!text) return;

  const newMsgRef = push(ref(db, "messages"));
  set(newMsgRef, {
    username: currentUser(),
    message: text,
    timestamp: Date.now()
  }).then(() => input.value = "");
}

sendBtn.addEventListener("click", messageSend);
input.addEventListener("keypress", e => { if (e.key === "Enter") messageSend(); });

// 🔹 Render messages
onChildAdded(ref(db, "messages"), snap => {
  const data = snap.val();
  const id = snap.key;

  const container = document.createElement("div");
  container.className = `message-container ${data.username === currentUser() ? "sent" : "received"}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  // Username
  const uname = document.createElement("div");
  uname.className = "username-box";
  uname.textContent = data.username;

  // Message text
  const msg = document.createElement("div");
  msg.className = "message-text";
  msg.textContent = data.message;

  // Timestamp
  const time = document.createElement("div");
  time.className = "message-time";
  const d = new Date(data.timestamp);
  time.textContent =
    d.getHours().toString().padStart(2, "0") + ":" +
    d.getMinutes().toString().padStart(2, "0");

  // Edit/Delete icons
  const btns = document.createElement("div");
  btns.className = "btn-container";
  if (data.username === currentUser()) {
    const edit = document.createElement("span");
    edit.textContent = "✏️";
    edit.addEventListener("click", () => {
      const newText = prompt("Edit message:", data.message);
      if (!newText) return;
      update(ref(db, `messages/${id}`), { message: newText });
    });
    const del = document.createElement("span");
    del.textContent = "🗑️";
    del.addEventListener("click", () => remove(ref(db, `messages/${id}`)));
    btns.append(edit, del);
  }

  bubble.append(uname, msg, time, btns);
  container.appendChild(bubble);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
});