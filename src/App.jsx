import { useEffect, useState } from "react";
import "./App.css";


function App() {

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("https://pdglfbjwawzdyhzbefyp.supabase.co/functions/v1/get-messages");
      const data = await res.json();
      console.log("API DATA:", data);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div>
      <h1>Marssan Inbox</h1>

      {messages.map((msg) => (
        <div key={msg.id}>
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
