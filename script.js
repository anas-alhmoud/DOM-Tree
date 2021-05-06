let canvas = document.querySelector('canvas')
let context = canvas.getContext("2d")

var nodes = [];
var DOM = document.getElementById("html");
var currentMoving = null;


var nodePath = new Path2D()

var circleRadius = 20;

function drawCircle(name, x, y) {

    context.beginPath();
    nodePath.moveTo(x, y);
    nodePath.arc(x, y, circleRadius, 0, 2 * Math.PI)
    context.arc(x, y, circleRadius, 0, 2 * Math.PI);
    context.font = "10px Arial";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, x, y);
    context.stroke();
}

var textBoxPath = new Path2D()

var rectangleSize = 40;
var rectangleOffset = 20

function drawRectangle(text, x, y) {

    context.beginPath();
    textBoxPath.rect(x - rectangleOffset, y - rectangleOffset, rectangleSize, rectangleSize);
    context.rect(x - rectangleOffset, y - rectangleOffset, rectangleSize, rectangleSize);
    context.font = "10px Arial";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.stroke();
}


var expandButtonPath = new Path2D()

var expandWidth = 10
var expandHeight = 5
var plusOffSet = 2.5

function drawPlus(x, y) {

    context.fillStyle = 'green'
    expandButtonPath.rect(x, y, expandWidth, expandHeight)
    expandButtonPath.rect(x + plusOffSet, y - plusOffSet, expandHeight, expandWidth)
    context.fillRect(x, y, expandWidth, expandHeight)
    context.fillRect(x + plusOffSet, y - plusOffSet, expandHeight, expandWidth)
    context.fillStyle = 'black'
}

function drawMinus(x, y) {

    context.fillStyle = 'red'
    expandButtonPath.rect(x, y, expandWidth, expandHeight)
    context.fillRect(x, y, expandWidth, expandHeight)
    context.fillStyle = 'black'
}

var attributtsButtonPath = new Path2D()

var attributtsButtonWidth = 15
var attributtsButtonHeight = 5

function drawAttributtsButton(x, y) {

    context.beginPath();
    attributtsButtonPath.rect(x, y, attributtsButtonWidth, attributtsButtonHeight)
    context.fillStyle = 'black'
    context.rect(x, y, attributtsButtonWidth, attributtsButtonHeight)
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("...", x + 7, y);
    context.stroke();
}

function showToolTip(node) {
    Invalidate()

    let maxWidth = canvas.clientWidth;
    let pad = maxWidth * (0.5 / 100)
    let y = 42; 
    let arr = node.dom.outerHTML.split("\n");
    let longestLine = arr.reduce((r, e) => r.length < e.length ? e : r, "");
    context.font = "15px Arial";
    let width = context.measureText(longestLine).width + pad + 10
    context.textAlign="left"
    context.beginPath();
    context.rect(pad, y-pad, width, arr.length*40/1.5 + pad*2);
    context.fillStyle = "rgba(0,0,0,0.5)"
    context.fill();
    context.beginPath();
    context.fillStyle = "white"
    for (let i = 0; i < arr.length; i++) {
        context.fillText(arr[i], pad*2, y + 10, width);
        y+= 40/1.5           
    }
}

function hideToolTip() {
    var ele = document.querySelector(".toolTip")
    ele.style.display = "none"
}

function capture() {
    var a = document.getElementById("download")
    a.style.display = "inline"
    a.href = canvas.toDataURL("image/png")
}


function getXY(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const y = event.clientY - rect.top
    const x = event.clientX - rect.left
    return { x: x, y: y }
}

canvas.addEventListener("click", function (e) {

    const XY = getXY(canvas, e);

    if (context.isPointInPath(expandButtonPath, XY.x, XY.y))
        expandButtonClicked(XY.x, XY.y)
    else if (context.isPointInPath(textBoxPath, XY.x, XY.y))
        loopOverNodes(XY.x, XY.y, textBoxClicked)
    else if (context.isPointInPath(attributtsButtonPath, XY.x, XY.y))
        loopOverNodes(XY.x, XY.y, attributtsButtonClicked)
    else if (context.isPointInPath(nodePath, XY.x, XY.y))
        loopOverNodes(XY.x, XY.y, nodeClicked)
});

canvas.addEventListener("mousemove", function (e) {

    const XY = getXY(canvas, e);

    if (currentMoving) {
        moveNode(XY.x)
        return;
    }

    if (context.isPointInPath(nodePath, XY.x, XY.y)) {
        loopOverNodes(XY.x, XY.y, nodeMouseOver)
    } else {
        Invalidate();
    }
});

canvas.addEventListener("mousedown", function (e) {

    const XY = getXY(canvas, e);

    if (context.isPointInPath(nodePath, XY.x, XY.y) || context.isPointInPath(textBoxPath, XY.x, XY.y)) {
        loopOverNodes(XY.x, XY.y, nodeMouseDown)
    }
});

canvas.addEventListener("mouseup", function (e) {
    currentMoving = null;
});

function moveNode(x) {

    if (x < currentMoving.xend - circleRadius * 1.7 && x > currentMoving.xstart + circleRadius * 1.7) {
        currentMoving.x = x;
        currentMoving.hasMoved = true
        Invalidate();
    }
}

function nodeMouseDown(x, y, node) {

    if (node instanceof Node) {
        if (node.NodeContains(x, y)) {
            currentMoving = node;
        }
    } else if (node instanceof TextNode) {

        if (node.BoxContains(x, y)) {
            currentMoving = node;
        }

    }
}

function nodeClicked(x, y, node) {

    if (node instanceof Node)
        if (node.NodeContains(x, y)) {
            var tag = prompt("Please enter a tag")
            if (tag) {
                var nodeDOM = document.createElement(tag);
                node.dom.appendChild(nodeDOM)
                startOver()
            } else {
                alert("tag name can not be null")
            }

        }
}

function nodeMouseOver(x, y, node) {

    if (node instanceof Node)
        if (node.NodeContains(x, y)) {
            showToolTip(node)
        }
}

function attributtsButtonClicked(x, y, node) {

    if (node instanceof Node)
        if (node.dom.hasAttributes() && node.AttributtsButtonContains(x, y)) {
            let msg = ""
            for (var i = 0; i < node.dom.attributes.length; i++) {
                var attrib = node.dom.attributes[i];
                msg += attrib.name + " = " + attrib.value + "\n";
            }
            alert(msg)
        }
}

function textBoxClicked(x, y, node) {

    if (node instanceof TextNode)
        if (node.BoxContains(x, y))
            alert(node.text);
}

function loopOverNodes(x, y, callback) {
    var _nodes = nodes.flat();

    for (let index = 0; index < _nodes.length; index++) {
        callback(x, y, _nodes[index])
    }
}

function expandButtonClicked(x, y) {

    var level = null
    loopOverNodes(x, y, (_, __, node) => {

        if (level && level < node.level) {
            node.hasMoved = false
        }

        if (node instanceof Node){

            if (node.showChildren && node.MinusButtonContains(x, y)) {
                node.showChildren = false

                level = node.level

            } else if (!node.showChildren && node.PlusButtonContains(x, y)) {
                node.showChildren = true

                level = node.level
            }
        }
    })

    Invalidate()
}

function Invalidate() {

    nodePath = new Path2D();
    textBoxPath = new Path2D();
    attributtsButtonPath = new Path2D();
    expandButtonPath = new Path2D()

    context.clearRect(0, 0, canvas.width, canvas.height);

    makeTree(0, 42)
}

function startOver() {

    nodes = [];
    inspectNodes(DOM, -1);
    Invalidate();
}

class AbstractNode {

    parent;
    x;
    y;
    xstart;
    xend;
    level;
    hasMoved = false

    constructor() {
        if (this.constructor == AbstractNode) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    DrawLine() {

        if (this.parent) {
            context.beginPath();
            context.moveTo(this.parent.x, this.parent.y + 20)
            context.lineTo(this.x, this.y - 20)
            context.stroke()
        }
    }

    Draw() {

        throw new Error('Implement Draw!');
    }

}

class Node extends AbstractNode {

    showChildren = true;

    dom;

    get GetExpandButtonXPosition() {
        return this.x - 32
    }

    get GetExpandButtonYPosition() {
        return this.y - 15
    }

    get GetAttributtsButtonXPosition() {
        return this.x - 35
    }

    get GetAttributtsButtonYPosition() {
        return this.y + 12
    }

    constructor(dom, parent, level) {
        super();

        this.dom = dom;
        this.parent = parent;
        this.level = level;
    }


    MinusButtonContains(x, y) {

        return this.GetExpandButtonXPosition <= x && x <= this.GetExpandButtonXPosition + expandWidth &&
            this.GetExpandButtonYPosition <= y && y <= this.GetExpandButtonYPosition + expandHeight
    }

    PlusButtonContains(x, y) {

        return (this.GetExpandButtonXPosition <= x && x <= this.GetExpandButtonXPosition + expandWidth &&
            this.GetExpandButtonYPosition <= y && y <= this.GetExpandButtonYPosition + expandHeight) ||
            (this.GetExpandButtonXPosition + plusOffSet <= x && x <= this.GetExpandButtonXPosition + plusOffSet + expandHeight &&
                this.GetExpandButtonYPosition - plusOffSet <= y && y <= this.GetExpandButtonYPosition - plusOffSet + expandWidth)
    }

    AttributtsButtonContains(x, y) {

        return this.GetAttributtsButtonXPosition <= x && x <= this.GetAttributtsButtonXPosition + attributtsButtonWidth &&
            this.GetAttributtsButtonYPosition <= y && y <= this.GetAttributtsButtonYPosition + attributtsButtonHeight
    }

    NodeContains(x, y) {

        return Math.abs(this.x - x) < circleRadius && Math.abs(this.y - y) < circleRadius;
    }

    Draw() {

        drawCircle(this.dom.tagName, this.x, this.y);
    }
}

class TextNode extends AbstractNode {

    text;

    get GetBoxXPosition() {
        return this.x - rectangleOffset
    }

    get GetBoxYPosition() {
        return this.y - rectangleOffset
    }

    constructor(text, parent, level) {
        super();

        this.text = text;
        this.parent = parent
        this.level = level;
    }

    BoxContains(x, y) {

        return this.GetBoxXPosition <= x && x <= this.GetBoxXPosition + rectangleSize &&
            this.GetBoxYPosition <= y && y <= this.GetBoxYPosition + rectangleSize
    }

    Draw() {

        drawRectangle(/*this.text*/ "...", this.x, this.y);
    }
}


function inspectNodes(dom, index, parent) {

    index++;

    var root = new Node(dom, parent, index)

    if (nodes[index]) {
        nodes[index].push(root)
    } else {
        nodes[index] = [root]
    }


    var temp = "";
    dom._customLength = dom.childNodes.length

    for (let i = 0; i < dom.childNodes.length; i++) {
        if (dom.childNodes[i].nodeName === "#text") {
            temp += dom.childNodes[i].nodeValue;
            dom._customLength--;
        }
    }


    if (temp.trim() !== "") {
        dom._customLength = 1

        var text = new TextNode(dom.textContent, root, index + 1);

        if (nodes[index + 1]) {
            nodes[index + 1].push(text)
        } else {
            nodes[index + 1] = [text]
        }
    }

    for (var i = 0; i < root.dom.childElementCount; i++) {
        inspectNodes(dom.children[i], index, root)
    }
}


function makeTree(index, y) {

    if (!nodes[index]) return;

    var arr = nodes[index];

    var length = function () {
        if (index == 0) return 1;
        return arr.filter(ele => ele.parent && ele.parent.showChildren).length
    }

    var d = canvas.width / (length());

    var tempStart = 0;
    var tempEnd = d;

    for (let i = 0; i < arr.length; i++) {

        var root = arr[i];

        // save position
        if (!root.hasMoved) {
            root.x = (tempStart + tempEnd) / 2;
        }

        root.y = y;

        if (root.parent && !root.parent.showChildren) {
            root.showChildren = false;
            continue;

        } else {

            if (root instanceof Node) {

                if (root.dom._customLength > 0) {
                    if (root.showChildren) {
                        drawMinus(root.GetExpandButtonXPosition, root.GetExpandButtonYPosition);
                    } else {
                        drawPlus(root.GetExpandButtonXPosition, root.GetExpandButtonYPosition);
                    }
                }

                if (root.dom.hasAttributes()) {
                    drawAttributtsButton(root.GetAttributtsButtonXPosition, root.GetAttributtsButtonYPosition)
                }
            }

            root.xstart = tempStart;
            root.xend = tempEnd;

            root.Draw();
            root.DrawLine();
            tempStart += d;
            tempEnd += d
        }

    }

    makeTree(index + 1, y + 150);
}

inspectNodes(DOM, -1);

makeTree(0, 42)
