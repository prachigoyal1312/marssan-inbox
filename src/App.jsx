import { useEffect, useState, useRef } from "react";
import "./App.css";

const INCOMING_SHEET = "14_FLPsuzbadnQyuS__itpVO2tHWUQcrHXuXOpY5K-4A";
const OUTGOING_SHEET = "1EEVHr6IUVTv8e8kBHUiIIFusU49Bq-xenQl6wpZ-Ykk";
const WEBHOOK_URL = "https://eocgwqbrg4pr9j9.m.pipedream.net";

function App() {

  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [unread, setUnread] = useState({});
  const [initialLoaded, setInitialLoaded] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {

    fetchSheet();

    const interval = setInterval(() => {
      fetchSheet();
    }, 3000);

    return () => clearInterval(interval);

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

    return rows
      .map((row) => {

        const time = row.c?.[0]?.v || "";
        const business = normalizeNumber(row.c?.[1]?.v);
        const customer = normalizeNumber(row.c?.[2]?.v);
        const content = row.c?.[3]?.v || "";
        const direction = row.c?.[4]?.v || "incoming";

        return {
          id: Math.random(),
          time,
          business_number: business,
          customer,
          content,
          direction
        };

      })
      .filter(
        (m) =>
          m.customer &&
          m.customer !== "customer" &&
          m.content &&
          m.content !== "reply"
      );

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

      const latest = {};

      allMessages.forEach((msg) => {

        if (!latest[msg.customer]) {
          latest[msg.customer] = msg;
        }

        if (new Date(msg.time) > new Date(latest[msg.customer].time)) {
          latest[msg.customer] = msg;
        }

      });

      const sortedCustomers = Object.values(latest)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .map((m) => m.customer);

      // FIX 1: customers update only when changed
      setCustomers(prev => {

        const newList = [...new Set(sortedCustomers)];

        if (JSON.stringify(prev) === JSON.stringify(newList)) {
          return prev;
        }

        return newList;

      });

      const newUnread = { ...unread };

      allMessages.forEach((msg) => {

        if (
          msg.customer !== selectedCustomer &&
          msg.direction === "incoming"
        ) {
          newUnread[msg.customer] = true;
        }

      });

      setUnread(newUnread);

      // FIX 2: only first load selection
      if (!initialLoaded && sortedCustomers.length > 0) {

        setSelectedCustomer(sortedCustomers[0]);
        setInitialLoaded(true);

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
      }, 1500);

    } catch (err) {

      console.error("Send error:", err);

    }

  };

  const filteredMessages = messages.filter(
    (m) => normalizeNumber(m.customer) === normalizeNumber(selectedCustomer)
  );

  return (

    <div className="container">

      <div className="sidebar">

        <h2>Customers</h2>

        {customers.map((cust, index) => (   // FIX 3: stable key

          <div
            key={cust + index}
            className={
              cust === selectedCustomer
                ? "customer active"
                : unread[cust]
                ? "customer unread"
                : "customer"
            }
            onClick={() => {

              setSelectedCustomer(cust);

              setUnread(prev => ({
                ...prev,
                [cust]: false
              }));

            }}
          >
            {cust}
          </div>

        ))}

      </div>

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
