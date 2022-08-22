import express from 'express'
import * as path from "path";
import * as http from "http";
import {Server} from "socket.io";
import {formatMessage} from "./utils/formatMessages.js";
import {getCurrentUser, getRoomUsers, userJoin, userLeaveChat} from "./utils/users.js";


const app = express()
const server = http.createServer(app)
const io = new Server(server)

const botName = 'SuperChat'

app.use(express.json())
app.use(express.static(path.resolve('public')))

app.set('views', path.resolve('public', 'views'))
app.set('view engine', 'ejs')

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        socket.emit('message', formatMessage(botName, 'Welcome to SuperChat!'))

        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        io
            .to(user.room)
            .emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(room)
        })
    })

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg.content))
    })

    socket.on('disconnect', () => {
        const user = userLeaveChat(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })
})

app.get('/', (req, res) => {
    res.render('index')
})


app.get('/chat.ejs', (req, res) => {
    res.render('chat')
})


export default server