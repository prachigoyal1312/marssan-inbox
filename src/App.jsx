import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchSheet();
  }, []);

  const fetchSheet = async () => {
    try {
      const res = await fetch(
        "https://docs.google.com/spreadsheets/d/1Nyj0yG7cT7NUXRpx4b3W8uXWBFS6ZMeHekSCzg-I82M/gviz/tq?tqx=out:json"
      );

      const text = await res.text();

      const json = JSON.parse(
        text.substring(47).slice(0, -2)
      );

      const rows = json.table.rows;

      const formatted = rows.slice(1).map((row, index) => ({
        id: index,
        time: row.c[0]?.v || "",
        business: row.c[1]?.v || "",
        customer: row.c[2]?.v || "",
        content: row.c[3]?.v || "",
        direction: row.c[4]?.v || "incoming"
      }));

      setMessages(formatted.reverse());
    } catch (err) {
      console.error("Sheet fetch error:", err);
    }
  };

  return (
    <div style={{ padding: 20, background: "#e5ddd5", minHeight: "100vh" }}>
      <h1>Marssan Inbox</h1>

      {messages.length === 0 && <p>No messages found</p>}

      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            display: "flex",
            justifyContent:
              msg.direction === "outgoing"
                ? "flex-end"
                : "flex-start",
            marginBottom: 8
          }}
        >
          <div
            style={{
              background:
                msg.direction === "outgoing"
                  ? "#DCF8C6"
                  : "#ffffff",
              padding: "8px 12px",
              borderRadius: 12,
              maxWidth: "60%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ fontSize: 14 }}>
              {msg.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
