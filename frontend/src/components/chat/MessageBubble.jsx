import React from "react";

export default function MessageBubble({ m }) {

  const me = JSON.parse(localStorage.getItem("user") || "null");

  const mine = String(m.sender._id) === String(me?._id);

  const getStatus = () => {
    if (!mine) return null;

    if (m.seen) return "✓✓";
    if (m.delivered) return "✓✓";
    return "✓";
  };

  return (

    <div
      style={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        padding: "6px 10px"
      }}
    >

      <div
        style={{
          maxWidth: "70%",
          background: mine ? "#DCF8C6" : "#fff",
          padding: "8px 12px",
          borderRadius: "12px",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.03)"
        }}
      >

        {/* TEXT MESSAGE */}
        {m.content && (
          <div style={{ marginBottom: 6 }}>
            {m.content}
          </div>
        )}

        {/* IMAGE MESSAGE */}
        {m.image && (
          <img
            src={m.image}
            alt="img"
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              marginBottom: 6
            }}
          />
        )}

        {/* VIDEO MESSAGE */}
        {m.file && m.file.match(/\.(mp4|webm|ogg)$/i) && (
          <video
            src={m.file}
            controls
            style={{
              maxWidth: "100%",
              borderRadius: 8,
              marginBottom: 6
            }}
          />
        )}

        {/* OTHER FILE TYPES */}
        {m.file && !m.file.match(/\.(mp4|webm|ogg)$/i) && !m.image && (
          <div style={{ marginBottom: 6 }}>
            
            <a href={m.file} target="_blank" rel="noreferrer">
  📄 {m.file.split("/").pop()}
</a>
          </div>
        )}

        {/* TIME + STATUS */}
        <div
          style={{
            fontSize: 11,
            color: "#666",
            marginTop: 4,
            textAlign: "right",
            display: "flex",
            justifyContent: "flex-end",
            gap: "4px"
          }}
        >

          <span>
            {new Date(m.createdAt).toLocaleTimeString()}
          </span>

          <span
            style={{
              color: m.seen ? "#2196f3" : "#666"
            }}
          >
            {getStatus()}
          </span>

        </div>

      </div>

    </div>

  );

}