const socket = io()

const messageInput = document.querySelector('#msg')
const chatMessages = document.querySelector('.message-block')
const sendMessageBtn = document.querySelector('.footer__send-message')
const currentRoom = document.querySelector('#room-name')
const usersList =  document.querySelector('#users')

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('joinRoom', {username, room})

// send message to server
sendMessageBtn.addEventListener('click', () => {
    socket.emit('chatMessage', {username, room, content: messageInput.value})
    messageInput.value = ''
    messageInput.focus()
})

// get message from server
socket.on('message', message => {
    createMessage(message)

    chatMessages.scrollTop = chatMessages.scrollHeight
})

// get room, users from server
socket.on('roomUsers', ({room, users}) => {
    createRoom(room)
    createUsers(users)
})


function createMessage (message) {
    const div = document.createElement('div')

    div.className = 'message-block__message message'

    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span</p>
                     <p class="text">${message.content}</p>`

    chatMessages.appendChild(div)
}

function createUsers (users) {
    usersList.innerHTML = `${users.map(user => `<li class="active-user">${user.username}</li>`).join('')}`
}

function createRoom (room) {
    currentRoom.textContent = room
}
