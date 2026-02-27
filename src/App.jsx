import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const res = await fetch("https://eocegw4zoij5b5q.m.pipedream.net");
      const data = await res.json();

      const msgs = data.messages || [];
      setMessages(msgs);

      const uniqueUsers = [...new Set(msgs.map((m) => m.wa_id))];
      setUsers(uniqueUsers);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  const filteredMessages = messages.filter(
    (m) => m.wa_id === activeUser
  );

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Marssan Inbox</h2>

        {users.map((user) => (
          <div
            key={user}
            className={`user ${activeUser === user ? "active" : ""}`}
            onClick={() => setActiveUser(user)}
          >
            {user}
          </div>
        ))}
      </div>

      <div className="chat">
        {activeUser ? (
          <>
            <div className="chat-header">{activeUser}</div>
            <div className="chat-body">
              {filteredMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`bubble ${msg.direction}`}
                >
                  {msg.message}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">Select a user</div>
        )}
      </div>
    </div>
  );
}

export default App;
