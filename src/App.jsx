import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabase = createClient(
  'https://ofluyvuqesnwouylqakf.supabase.co',
  'sb_publishable_fGwIJ7n_SyFJHDpNHQgUeQ_PFVEZU8V'
);

function App() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase.from('messages').select('*');

    console.log('DATA:', data);
    console.log('ERROR:', error);

    if (data) {
      const uniqueUsers = [...new Set(data.map((d) => d.wa_id))];
      setUsers(uniqueUsers);
    }
  }

  async function fetchMessages(wa_id) {
    setActiveUser(wa_id);

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('wa_id', wa_id)
      .order('created_at', { ascending: true });

    setMessages(data);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Marssan Inbox</h2>
        {users.map((user) => (
          <div
            key={user}
            className={`user ${activeUser === user ? 'active' : ''}`}
            onClick={() => fetchMessages(user)}
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
              {messages.map((msg, i) => (
                <div key={i} className={`bubble ${msg.direction}`}>
                  {msg.message}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">Select a customer to view chat</div>
        )}
      </div>
    </div>
  );
}

export default App;
