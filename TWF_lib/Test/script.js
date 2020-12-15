const app = new PIXI.Application({
    backgroundColor: 0x1F1F1F,
    width: 800,
    height: 600
});
document.body.appendChild(app.view);

const style = new PIXI.TextStyle({
    fontFamily: 'u2000',
    fontSize: 100,
    fill: 0xCCCCCC
});
/*
function Division(a, b, cont) {
    b.y += a.height;
    let line = new PIXI.Graphics();
    line.lineStyle(6, 0xCCCCCC, 1);
    line.moveTo(0, 0);
    line.lineTo(Math.max(a.width, b.width), 0);
    line.interactive = true;
    line.buttonMode = true;
    line.hitArea = new PIXI.Polygon([
        line.x, line.y - line.height * 2,
        line.x + line.width, line.y - line.height * 2,
        line.x + line.width, line.y + line.height * 2,
        line.x, line.y + line.height * 2,
    ]);
    line.y += a.height;
    line
        .on('pointerdown', (event) => onButtonDown(cont))
        .on('pointerup', (event) => onButtonOver(cont))
        .on('pointerover', (event) => onButtonOver(cont))
        .on('pointerout', (event) => onButtonOut(cont));
    a.x += (line.width - a.width) / 2;
    b.x += (line.width - b.width) / 2;
    cont.addChild(a);
    cont.addChild(b);
    cont.addChild(line);
    cont.scale.x /= 2;
    cont.scale.y /= 2;
}
*/
function MakeNode(node) {
    this.value = node.value;
    this.children = [];
     this.add = function (child_node) {
         this.children.push(child_node);
     }
    this.cont = new PIXI.Container();
    this.twfNode = node;
}

function MakeTree(node) {
    let cur_node = new MakeNode(node);
    for (let i = 0; i < node.children.size; i++) {
        cur_node.add(MakeTree(node.children.toArray()[i]));
    }
    return cur_node;
}

function interactive_text(value, cont) {
    let tmp = new PIXI.Text(value, style);
    tmp.interactive = true;
    tmp.buttonMode = true;
    tmp
        .on('pointerdown', (event) => onButtonDown(cont))
        .on('pointerup', (event) => onButtonOver(cont))
        .on('pointerover', (event) => onButtonOver(cont))
        .on('pointerout', (event) => onButtonOut(cont));
    return tmp;
}

let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$("+(A;*(B;C))");

let TreeRoot = MakeTree(NewTreeRoot.children.toArray()[0]);

function PrintTree(v) {
    let delta = 0;
    let cur_cont = v.cont;
    if (v.value === "/") {
        Division(PrintTree(v.children[0]), PrintTree(v.children[1]), cur_cont);
    } else if (v.children.length > 1) {
        let first_child = PrintTree(v.children[0]);
        cur_cont.addChild(first_child);
        delta += first_child.width;
        for (let i = 1; i < v.children.length; i++) {
            let tmp = interactive_text(v.value, v.cont);
            tmp.x = delta;
            cur_cont.addChild(tmp);
            delta += tmp.width;
            tmp = PrintTree(v.children[i]);
            tmp.x = delta;
            cur_cont.addChild(tmp);
            delta += tmp.width;
        }
    } else if (v.children.length === 1) {
        let tmp = interactive_text(v.value + '(', v.cont);
        tmp.x = delta;
        cur_cont.addChild(tmp);
        delta += tmp.width;
        tmp = PrintTree(v.children[0]);
        tmp.x = delta;
        cur_cont.addChild(tmp);
        delta += tmp.width;
        tmp = interactive_text(')', v.cont);
        tmp.x = delta;
        cur_cont.addChild(tmp);
    } else {
        let tmp = interactive_text(v.value, v.cont);
        cur_cont.addChild(tmp);
    }
    return cur_cont;
}

let expr = PrintTree(TreeRoot);
expr.position.set(100, 100);

app.stage.addChild(expr);

function onButtonDown(con) {
    con.tint = 0x00FFFF;
    for (let item of con.children) {
        onButtonDown(item);
    }
}

function onButtonOver(con) {
    con.tint = 0xAAAAAA;
    for (let item of con.children) {
        onButtonOver(item);
    }
}

function onButtonOut(con) {
    con.tint = 0xFFFFFF;
    for (let item of con.children) {
        onButtonOut(item);
    }
}
