// src/App.tsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust this URL to match your server's address

interface User {
  id: string;
  username: string;
  email: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    // Listen for 'getUser' event to update users list
    socket.on("getUser", (data: User[]) => {
      setUsers(data);
    });

    // Cleanup listener on component unmount
    return () => {
      socket.off("getUser");
    };
  }, []);

  const handleCreateUser = () => {
    // Emit the 'createUser' event with user data
    socket.emit("createUser", {
      username,
      email,
      password,
    });

    // Clear input fields
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
          </li>
        ))}
      </ul>

      <h2>Create New User</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
};

export default App;
