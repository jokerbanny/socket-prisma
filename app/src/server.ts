import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import prisma from "./utils/prisma";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust the CORS settings if needed
  },
});

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle socket connection
io.on("connection", async (socket) => {
  console.log("Client connected");

  try {
    // Fetch the users from the database
    const users = await prisma.users.findMany();

    // Emit the users back to the client that connected
    socket.emit("getUser", users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  // Handle creating a new user
  socket.on("createUser", async (userData) => {
    try {
      // Create a new user in the database
      const newUser = await prisma.users.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: userData.password, // Ensure to hash the password before storing in production
        },
      });

      // Emit the updated users list to all clients
      const updatedUsers = await prisma.users.findMany();
      io.emit("getUser", updatedUsers);
    } catch (error) {
      console.error("Error creating user:", error);
      // Optionally send an error message back to the client
      socket.emit("error", {
        // @ts-ignore
        message: "Error creating user: " + error.message,
      });
    }
  });

  // Handle socket disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port:${PORT} mode:${process.env.NODE_ENV}`)
);
