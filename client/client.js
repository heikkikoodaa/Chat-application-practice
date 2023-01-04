import { io } from 'socket.io-client';
import { users } from './users';

const messageWindow = document.getElementById('message-window');
const messages = document.getElementById('messages');
const welcomeBanner = document.getElementById('welcome-banner');
const sendMessageForm = document.getElementById('send-message-form');
const onlineUsers = document.getElementById('online-users');
const joinRoomForm = document.getElementById('join-room-form');

const newMessageInput = document.getElementById('new-message');

const messageButton = document.getElementById('send-message-button');
const roomButton = document.getElementById('join-room-button');

const namepool = ['sakura', 'majima', 'kazuma', 'dragon', 'genji'];
const forbiddenWords = [
  'perkele',
  'vittu',
  'saatana',
  'helvetti',
  'fuck',
  'shit',
  'bullshit',
  'mulkku',
  'kusipää',
];

const randomUsername = () => {
  const index = Math.floor(Math.random() * namepool.length);
  const randomNum = Math.floor(Math.random() * 15000);
  return `${namepool[index]}${randomNum}`;
};

const username = randomUsername();

const socket = io('http://localhost:1337');

socket.on('connect', () => {
  welcomeBanner.innerText = `Welcome to the chatroom!\n Your unique chatID is ${socket.id}\n Your username is ${username}`;
  socket.emit('user-join', username);
  newMessage(`Welcome to the chatroom ${username}`);
  // updateOnlineUsers();
});

socket.on('send-message', (incomingMessage) => {
  appendMessage(incomingMessage);
});

socket.on('user-left', (username) => {
  appendMessage(`User ${username} went offline!`);
  // updateOnlineUsers();
});

const appendMessage = (msg) => {
  const p = document.createElement('p');
  p.innerText = msg;
  messages.appendChild(p);
};

// const updateOnlineUsers = () => {
//   console.log(users);
// };

sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = newMessageInput.value;

  if (message === '') return;
  newMessage(message, username);
});

const checkMessage = (message) => {
  if (message.startsWith('!') && message.toLowerCase() === '!exit') {
    socket.disconnect();
    alert('You have left the chat!');
    newMessageInput.value = '';
    sendMessageForm.classList.add('hidden');
    joinRoomForm.classList.add('hidden');
    return;
  }
  let regex = new RegExp(forbiddenWords.join('|'), 'gi');
  return message.replace(regex, '****');
};

const newMessage = (message, sender = '') => {
  const filteredMessage = checkMessage(message);
  if (!filteredMessage) {
    return;
  }
  if (sender) {
    appendMessage(`${sender}: ${filteredMessage}`);
    socket.timeout(5000).emit('new-message', filteredMessage, sender);
  } else {
    appendMessage(filteredMessage);
  }
  newMessageInput.value = '';
};
