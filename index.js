const express = require('express');
const app = express();
const ejs = require('ejs');
const server = require('http').createServer(app);
const io = require('socket.io')(server);


const port = process.env.PORT || 3000;

actionList = []

io.on('connection', (socket) => {
    console.log('User online: ' + socket.id);

    actionList.forEach((element) => {
        if (element === 'undo-command') {
            socket.emit('undo-command');
        } else if (element === 'redo-command') {
            socket.emit('redo-command');
        } else {
            socket.emit('draw-command', element);
        }
    });

    socket.on('draw-command', (data) => {
        actionList.push(data);
        socket.broadcast.emit('draw-command', data);
    });

    socket.on('undo-command', () => {
        actionList.push('undo-command');
        socket.broadcast.emit('undo-command');
    });

    socket.on('redo-command', () => {
        actionList.push('redo-command');
        socket.broadcast.emit('redo-command');
    });

    socket.on('clear-canvas', () => {
        actionList = [];
        socket.broadcast.emit('clear-canvas');
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
    });
});
 
server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('main.ejs');
});