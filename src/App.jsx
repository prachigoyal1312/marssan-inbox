import { useEffect, useState } from "react";

const SHEET_ID = "YOUR_SHEET_ID";

function App() {
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchSheet();
  }, []);

  const fetchSheet = async () => {
    try {
      const res = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
      );
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
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

      const uniqueCustomers = [
        ...new Set(formatted.map((m) => m.customer))
      ];

      setCustomers(uniqueCustomers);

      if (!selectedCustomer && uniqueCustomers.length > 0) {
        setSelectedCustomer(uniqueCustomers[0]);
      }
    } catch (err) {
      console.error("Sheet fetch error:", err);
    }
  };

  const filteredMessages = messages.filter(
    (msg) => msg.customer === selectedCustomer
  );

  const handleSend = () => {
    alert("Message sending logic Pipedream se connect karna hai.");
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #ddd",
          overflowY: "auto"
        }}
      >
        <h2 style={{ padding: 15 }}>Customers</h2>

        {customers.map((cust) => (
          <div
            key={cust}
            onClick={() => setSelectedCustomer(cust)}
            style={{
              padding: 15,
              cursor: "pointer",
              background:
                cust === selectedCustomer ? "#f0f0f0" : "#fff",
              borderBottom: "1px solid #eee"
            }}
          >
            {cust}
          </div>
        ))}
      </div>

      {/* RIGHT CHAT AREA */}
      <div
        style={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          background: "#e5ddd5"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 15,
            background: "#075E54",
            color: "#fff"
          }}
        >
          {selectedCustomer || "Select customer"}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: 15,
            overflowY: "auto"
          }}
        >
          {filteredMessages.map((msg) => (
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
                  maxWidth: "60%"
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          style={{
            display: "flex",
            padding: 10,
            background: "#f0f0f0"
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 20,
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={handleSend}
            style={{
              marginLeft: 10,
              padding: "10px 15px",
              background: "#25D366",
              border: "none",
              color: "#fff",
              borderRadius: 20,
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
