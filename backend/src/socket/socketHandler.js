
const { redis } = require("../config/redis");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinSession", (sessionId) => {
      socket.join(`session:${sessionId}`);
      console.log(`User joined session: ${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
