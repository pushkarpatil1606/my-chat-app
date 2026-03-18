import React from "react";

export default function ChatListItem({ chat, onClick, active }) {

  const me = JSON.parse(localStorage.getItem("user"));

  // If chat.users exists (normal chat)
  let name = "Unknown";

  if (chat.users) {
    const otherUser = chat.users.find(u => u._id !== me._id);
    name = otherUser ? otherUser.name : "Chat";
  }

  // If we are showing users list instead
  if (chat.name) {
    name = chat.name;
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px",
        cursor: "pointer",
        background: active ? "#eee" : "white"
      }}
    >
      <div style={{ fontWeight: "600" }}>{name}</div>
    </div>
  );
}