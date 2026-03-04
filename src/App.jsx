import { useEffect, useState, useRef } from "react";
import "./App.css";

const INCOMING_SHEET = "14_FLPsuzbadnQyuS__itpVO2tHWUQcrHXuXOpY5K-4A";
const OUTGOING_SHEET = "1vj6Xi6e9RJ6d5lpvg7TguzYe6cj0O3TlzFKgvdDSwNM";
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedCustomer]);

  const normalizeNumber = (num) => {
    return String(num || "")
      .replace(".0", "")
      .replace(/\s/g, "")
      .trim();
  };

  const fetchGViz = async (sheetId) => {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
    );

    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    return json?.table?.rows || [];
  };

  const parseRows = (rows) => {

    return rows.map((row) => ({
      id: Math.random(),
      time: row.c?.[0]?.v || "",
      business_number: normalizeNumber(row.c?.[1]?.v),
      customer: normalizeNumber(row.c?.[2]?.v),
      content: row.c?.[3]?.v || "",
      direction: row.c?.[4]?.v || "incoming"
    }));

  };

  const fetchSheet = async () => {

    try {

      const incomingRows = await fetchGViz(INCOMING_SHEET);
      const outgoingRows = await fetchGViz(OUTGOING_SHEET);

      const incomingData = parseRows(incomingRows);
      const outgoingData = parseRows(outgoingRows);

      const allMessages = [...incomingData, ...outgoingData];

      allMessages.sort(
        (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
      );

      setMessages(allMessages);

      const uniqueCustomers = [
        ...new Set(
          allMessages
            .map((m) => m.customer)
            .filter((c) => c && c !== "")
        )
      ];

      setCustomers(uniqueCustomers);

      if (!selectedCustomer && uniqueCustomers.length > 0) {
        setSelectedCustomer(uniqueCustomers[0]);
      }

    } catch (err) {
      console.error("Sheet fetch error:", err);
    }

  };

  const handleSend = async () => {

    if (!newMessage.trim() || !selectedCustomer) return;

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
      }, 2000);

    } catch (err) {
      console.error("Send error:", err);
    }

  };

  const filteredMessages = messages.filter(
    (m) => normalizeNumber(m.customer) === normalizeNumber(selectedCustomer)
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

      {/* Chat Section */}

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

          <button onClick={handleSend}>
            Send
          </button>

        </div>

      </div>

    </div>

  );

}

export default App;
