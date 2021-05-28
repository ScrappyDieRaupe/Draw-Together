import { DrawCommand, UndoStack } from './classes.js';
import { trackTransforms } from './panzoom.js';
import { initializeChat } from './chat.js';


const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const colorWell = document.querySelector("#colorWell");
let undoStack = new UndoStack(ctx);
let drawCommand;

// Variables
let lineWidth = 3;
let lineCap = 'round';
let strokeStyle = 'black';
let isDrawing = false;
let isErasing = false;
let isDragging = false;

window.onload = function () {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    trackTransforms(ctx);
    redraw();
    initializeChat(socket);
};


function startDrawing(e) {
    if (isDragging) return;
    isDrawing = true;
    drawCommand = new DrawCommand(ctx, lineWidth, lineCap, strokeStyle); 
    draw(e);
}

function stopDrawing() {
    if (isDragging) return;
    isDrawing = false;
    ctx.beginPath();
    undoStack.push(drawCommand);
    sendData('draw-command', drawCommand.getSpecs());
}

function draw(e) {
    if (!isDrawing) return;
    drawCommand.execute(e.clientX - (offsetX), e.clientY - (offsetY));
}

function activate(element) {
    $('.activatable').each((i, obj) => {
        $(obj).removeClass('activated');
        if (obj == element) {
            $(obj).addClass('activated');
        }
    });
}

function undo() {
    undoStack.undo();
    sendData('undo-command', {});
}

function redo() {
    undoStack.redo();
    sendData('redo-command', {});
}

document.querySelector('#undo').addEventListener('click', undo);
document.querySelector('#redo').addEventListener('click', redo);

document.querySelector('#pencil').addEventListener('click', () => {
    activate(document.querySelector('#pencil'));
    strokeStyle = colorWell.value;
    isErasing = false;
    isDragging = false;
    $('#canvas').css('cursor', 'crosshair');
});

colorWell.addEventListener('change', (e) => {
    if (!isErasing) strokeStyle = e.target.value;
    $('#input-color-label').css('color', e.target.value);
});

document.querySelector('#eraser').addEventListener('click', () => {
    activate(document.querySelector('#eraser'));
    strokeStyle = "white";
    isErasing = true;
    isDragging = false;
    $('#canvas').css('cursor', 'crosshair');
});
 
document.querySelector('#dragging').addEventListener('click', () => {
    activate(document.querySelector('#dragging'));
    isDragging = true;
    $('#canvas').css('cursor', 'grab');
});
 
document.querySelector('#clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.flushStack();
    sendData('clear-canvas', {});
    redraw();
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);


let keysPressed = {};

document.addEventListener('keydown', (event) => {
    if (isDragging) return;
    keysPressed[event.key] = true;
    if (keysPressed['Control'] && event.key == 'z') {
        undo();
    }

    if (keysPressed['Control'] && event.key == 'y') {
        redo();
    }
});

document.addEventListener('keyup', (event) => {
    if (isDragging) return;
    delete keysPressed[event.key];
});

const socket = io.connect('http://localhost:3000');
socket.on('draw-command', getData);
socket.on('undo-command', () => { undoStack.undo(); });
socket.on('redo-command', () => { undoStack.redo(); });
socket.on('clear-canvas', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.flushStack();
});

function getData(data) {
    var command = new DrawCommand(ctx, data.lineWidth, data.lineCap, data.strokeStyle);
    command.setStrokeList(data.strokeList);
    command.drawStroke();
    undoStack.push(command);
}

function sendData(event, data) {
    socket.emit(event, data);
}


/* Copyright (c) 2021 by TechSlides (https://codepen.io/techslides/pen/zowLd) */

// Pan / Zoom
function redraw() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    undoStack.redrawAll();
}

var lastX = canvas.width / 2, lastY = canvas.height / 2;
var dragStart, dragged;
var offsetX = 0;
var offsetY = 0;

canvas.addEventListener('mousedown', function (evt) {
    if (!isDragging) return
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX, lastY);
    dragged = false;
}, false);

canvas.addEventListener('mousemove', function (evt) {
    if (!isDragging) return
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart) {
        var pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        offsetX += (pt.x - dragStart.x) * test;
        offsetY += (pt.y - dragStart.y) * test;
        redraw();
    }
}, false);

canvas.addEventListener('mouseup', function (evt) {
    if (!isDragging) return
    dragStart = null;
}, false);

var scaleFactor = 1.1;
var test = 1;

var zoom = function (clicks) {
    var pt = ctx.transformedPoint(lastX, lastY);
    ctx.translate(pt.x, pt.y);
    var factor = Math.pow(scaleFactor, clicks);
    test *= factor;
    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);
    redraw();
}

var handleScroll = function (evt) {
    var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
};

canvas.addEventListener('DOMMouseScroll', handleScroll, false);
canvas.addEventListener('mousewheel', handleScroll, false);





    

    
