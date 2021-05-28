class Command {
    constructor(canvas, lineWidth, lineCap, strokeStyle) {
        this.ctx = canvas;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.strokeStyle = strokeStyle;
    }

    execute() {}
}

class DrawCommand extends Command {
    strokeList = []; // Save all drawn dots in a stroke in order to undo them all at once 

    constructor(canvas, lineWidth, lineCap, strokeStyle) {
        super(canvas, lineWidth, lineCap, strokeStyle);
    }

    execute(mouseX, mouseY) {
        this.drawSinglePoint(mouseX, mouseY);
        this.strokeList.push([mouseX, mouseY]);
    }

    drawSinglePoint(mouseX, mouseY) {
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = this.lineCap;
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();
    }

    drawStroke() {
        this.strokeList.forEach((coords) => { this.drawSinglePoint(coords[0], coords[1]) });
        this.ctx.beginPath();
    }

    getSpecs() {
        return {
            lineWidth: this.lineWidth,
            lineCap: this.lineCap,
            strokeStyle: this.strokeStyle,
            strokeList: this.strokeList
        }
    }

    setStrokeList(strokeList) {
        this.strokeList = strokeList;
    }
}


class Stack {
    arr = [];

    constructor(canvas) {
        this.ctx = canvas;
    }

    push(command) {
        this.arr.push(command);
    }

    pop() { return this.arr.pop(); }

    top() { return this.arr[this.arr.length - 1]; }

    flushStack() { this.arr = []; }

    redo() { return this.pop(); }
}

class UndoStack extends Stack {
    constructor(canvas) {
        super(canvas);
        this.redoStack = new Stack();
    }

    push(command) {
        super.push(command)
        this.redoStack.flushStack();
    }

    undo() {
        if (this.arr.length == 0) return;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.redoStack.push(this.pop());
        this.arr.forEach((command) => { command.drawStroke(); });
    }

    redrawAll() {
        if (this.arr.length == 0) return;
        this.arr.forEach((command) => { command.drawStroke(); });
    }

    redo() {
        const command = this.redoStack.redo();
        if (command != undefined) {
            command.drawStroke();
            super.push(command);
        }
    }
}

export { DrawCommand, UndoStack };