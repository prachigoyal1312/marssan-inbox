import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://pdglfbjwawzdyhzbefyp.supabase.co",
  "sb_publishable_HiCiRjvVBhY-w1UfpIQR1g_0gycok1J"
);

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setMessages(data);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Marssan Inbox</h1>

      {messages.length === 0 && <p>No messages found</p>}

      {messages.map((msg) => (
        <div key={msg.id}>
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
