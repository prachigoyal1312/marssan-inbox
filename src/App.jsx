import { useEffect, useState, useRef } from "react";
import "./App.css";

const SHEET_ID = "1Nyj0yG7cT7NUXRpx4b3W8uXWBFS6ZMeHekSCzg-I82M";
const WEBHOOK_URL = "https://eocgwqbrg4pr9j9.m.pipedream.net";

function App() {
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSheet();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedCustomer]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

const fetchSheet = async () => {
  try {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
    );

    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json?.table?.rows || [];

    const formatted = rows.map((row, index) => ({
      id: index,
      time: row.c?.[0]?.v || "",
      business_number: row.c?.[1]?.v || "",
      customer: row.c?.[2]?.v?.toString().trim() || "",
      content: row.c?.[3]?.v || "",
      direction: row.c?.[4]?.v || "incoming"
    }));

    // DO NOT FILTER ANYTHING
    formatted.sort(
      (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
    );

    setMessages(formatted);

    const uniqueCustomers = [
      ...new Set(
        formatted
          .map((m) => m.customer)
          .filter((c) => c && c !== "")
      )
    ];

    console.log("CUSTOMERS AFTER FIX:", uniqueCustomers);

    setCustomers(uniqueCustomers);

  } catch (err) {
    console.error("Sheet fetch error:", err);
  }
};

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedCustomer) return;

    const tempMessage = {
      id: Date.now(),
      customer: selectedCustomer,
      content: newMessage,
      direction: "outgoing"
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          wa_id: selectedCustomer,
          message: newMessage
        })
      });

      setNewMessage("");

      setTimeout(() => {
        fetchSheet();
      }, 1500);

    } catch (err) {
      console.error("Send error:", err);
    }
  };

  const filteredMessages = messages.filter(
    (m) => m.customer === selectedCustomer
  );

  return (
    <div className="container">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>Customers</h2>
        {customers.map((cust) => (
          <div
            key={cust}
            className={
              cust === selectedCustomer
                ? "customer active"
                : "customer"
            }
            onClick={() => setSelectedCustomer(cust)}
          >
            {cust}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="chat-section">

        <div className="chat-header">
          {selectedCustomer || "Select Customer"}
        </div>

        <div className="chat-area">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.direction === "outgoing"
                  ? "message outgoing"
                  : "message incoming"
              }
            >
              {msg.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="button" onClick={handleSend}>
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
