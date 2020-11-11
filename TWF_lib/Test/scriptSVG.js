const app = new SVG().addTo('body').size(800, 600);
app.viewbox(0, 0, 800, 600);
app.rect(800, 600).fill('#1F1F1F');

/*
function recSizeChange(cont) {
    for (let item of cont.children) {
        if (item.isSprite) {
            item.scale.x /= 1.4;
            item.scale.y /= 1.4;
        } else {
            recSizeChange(item)
        }
    }
}

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
    cont.scale.x /= 1.4;
    cont.scale.y /= 1.4;
    cont.y -= cont.height / 2 - a.height / 2;
}
*/

function MakeNode(node) {
    this.value = node.value;
    this.children = [];
    this.add = function(child_node) {
        this.children.push(child_node);
    }
    this.cont = app.nested();
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
    let tmp = cont.nested().text(value).font({
        size: 100,
        family: 'u2000',
        fill: '#CCCCCC'
    });
    tmp.css('cursor', 'pointer');
    tmp
        .on('mousedown', (event) => onButtonDown(cont))
        .on('mouseup mouseover', (event) => onButtonOver(cont))
        .on('mouseout', (event) => onButtonOut(cont));
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
        cur_cont.add(first_child);
        delta += first_child.bbox().width;
        for (let i = 1; i < v.children.length; i++) {
            let tmp = interactive_text(v.value, v.cont);
            tmp.dx(delta);
            cur_cont.add(tmp);
            delta += tmp.bbox().width;
            tmp = PrintTree(v.children[i]);
            tmp.dx(delta);
            cur_cont.add(tmp);
            delta += tmp.bbox().width;
        }
    } else if (v.children.length === 1) {
        let tmp = interactive_text(v.value + '(', v.cont);
        tmp.dx(delta);
        cur_cont.add(tmp);
        delta += tmp.bbox().width;
        tmp = PrintTree(v.children[0]);
        tmp.dx(delta);
        cur_cont.add(tmp);
        delta += tmp.bbox().width;
        tmp = interactive_text(')', v.cont);
        tmp.dx(delta);
        cur_cont.add(tmp);
    } else {
        let tmp = interactive_text(v.value, v.cont);
        cur_cont.add(tmp);
    }
    return cur_cont;
}

let expr = PrintTree(TreeRoot);
expr.x(100);
expr.y(100);

function onButtonDown(con) {
    con.fill('#00FFFF');
    for (let item of con.children()) {
        onButtonDown(item);
    }
}

function onButtonOver(con) {
    con.fill('#AAAAAA');
    for (let item of con.children()) {
        onButtonOver(item);
    }
}

function onButtonOut(con) {
    con.fill('#CCCCCC');
    for (let item of con.children()) {
        onButtonOut(item);
    }
}
