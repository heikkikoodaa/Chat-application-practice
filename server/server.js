import { Server } from 'socket.io';
import { users, modifyUserList } from '../client/users.js';

const io = new Server(1337, {
  cors: {
    origin: 'http://localhost:8080',
  },
});

io.on('connection', (socket) => {
  socket.on('new-message', (message, sender) => {
    socket.broadcast.emit('send-message', `${sender}: ${message}`);
  });

  socket.once('user-join', (user) => {
    const userObj = {
      id: socket.id,
      username: user,
      status: 'online',
    };
    users.push(userObj);
  });

  socket.once('disconnect', () => {
    const newUsers = users.map((item) => {
      if (item.id === socket.id) {
        return { ...item, status: 'offline' };
      } else {
        return item;
      }
    });
    modifyUserList(newUsers);
    const selectedUser = users.find((item) => item.id === socket.id);
    io.emit('user-left', selectedUser.username);
  });
});
