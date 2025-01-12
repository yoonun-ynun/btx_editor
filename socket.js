const SocketIO = require("socket.io");

console.log("socket.js");

module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });
    
    io.on("connection", (socket) => {
        console.log("New client connected");
        socket.on("disconnect", () => {
        console.log("Client disconnected");
        });
    });
};
