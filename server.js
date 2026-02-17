const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Раздаем статику (наш фронтенд)
app.use(express.static(path.join(__dirname, '/')));

let globalPosts = [];
let onlineUsers = new Map(); // socket.id => username

io.on('connection', (socket) => {
    // При входе отправляем историю постов
    socket.emit('init_posts', globalPosts);

    socket.on('register_user', (username) => {
        socket.username = username;
        onlineUsers.set(socket.id, username);
        io.emit('online_update', Array.from(onlineUsers.values()));
    });

    socket.on('new_wave', (post) => {
        const fullPost = { ...post, id: Date.now(), echoes: [], replies: [] };
        globalPosts.unshift(fullPost);
        if (globalPosts.length > 50) globalPosts.pop(); // Храним только 50 последних
        io.emit('broadcast_wave', fullPost);
    });

    socket.on('send_reply', ({postId, reply}) => {
        const post = globalPosts.find(p => p.id === postId);
        if (post) {
            post.replies.push(reply);
            io.emit('update_post', post);
        }
    });

    socket.on('toggle_echo', ({postId, user}) => {
        const post = globalPosts.find(p => p.id === postId);
        if (post) {
            const idx = post.echoes.indexOf(user);
            idx === -1 ? post.echoes.push(user) : post.echoes.splice(idx, 1);
            io.emit('update_post', post);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('online_update', Array.from(onlineUsers.values()));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`EKHOO ONLINE ON PORT ${PORT}`));