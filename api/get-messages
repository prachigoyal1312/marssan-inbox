import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/get-messages");   // 👈 IMPORTANT CHANGE
      const data = await res.json();

      console.log("API DATA:", data);

      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        console.error("API Error:", data);
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Marssan Inbox</h1>

      {loading && <p>Loading...</p>}

      {!loading && messages.length === 0 && (
        <p>No messages found</p>
      )}

      {messages.map((msg) => (
        <div key={msg.id} style={{ marginBottom: "10px" }}>
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
