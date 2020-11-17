const app = new SVG().addTo('body').size(1000, 800);
app.viewbox(0, 0, 1000, 800);
app.rect(1000, 800).fill('#1F1F1F');
const chr_size = [110.8125, 78.421875, 55.21875];

function MakeNode(node) {
    this.value = node.value;
    //this.size = 0;
    //this.type = node.nodeType;
    this.children = [];
    this.add = function(child_node) {
        this.children.push(child_node);
    }
    this.cont = app.group();
    this.twfNode = node;
}

function MakeTree(node) {
    let cur_node = new MakeNode(node);
    for (let i = 0; i < node.children.size; i++) {
        cur_node.add(MakeTree(node.children.toArray()[i]));
    }
    return cur_node;
}

function interactive_text(value, cont, size) {
    let tmp = cont.group().text(value).font({
        size: 100 * (size === 0) + 71 * (size === 1) + 50 * (size >= 2),
        family: 'u2000',
        fill: '#CCCCCC'
    });
    tmp.css('cursor', 'pointer');
    tmp.leading(0.9);
    tmp
        .on('mousedown', (event) => onButtonDown(cont))
        .on('mouseup mouseover', (event) => onButtonOver(cont))
        .on('mouseout', (event) => onButtonOut(cont));
    return tmp;
}

let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$("+(X;/(X;/(X;/(X;/(X;/(X;/(X;/(X;/(X;X)))))))))");

let TreeRoot = MakeTree(NewTreeRoot.children.toArray()[0]);

function Division(a, b, cont, size) {
    cont.add(a);
    cont.add(b);
    let width = Math.max(a.bbox().width, b.bbox().width) + 30;
    let height = 5 * (size === 1) + 4 * (size === 2) + 3 * (size >= 3);
    let line = cont.group().rect(width, height)
                            .fill('#CCCCCC')
                            .move(a.bbox().x, a.bbox().y);
    line.css('cursor', 'pointer');
    line
        .on('mousedown', (event) => onButtonDown(cont))
        .on('mouseup mouseover', (event) => onButtonOver(cont))
        .on('mouseout', (event) => onButtonOut(cont));
    line.dy(a.bbox().height);
    b.y(a.bbox().y + a.bbox().height + line.height());
    a.dx((line.width() - a.bbox().width) / 2);
    b.dx((line.width() - b.bbox().width) / 2);
    return a.bbox().height + line.height() / 3;
}

function PrintTree(v, size) {
    let vert_shift = 0;
    let delta = 0;
    let cur_cont = v.cont;
    if (v.value === "/") {
        vert_shift = -Division(PrintTree(v.children[0], size + 1)[0], PrintTree(v.children[1], size + 1)[0], cur_cont, size + 1);
    } else if (v.children.length > 1) {
        let [first_child, cur_shift] = PrintTree(v.children[0], size);
        cur_cont.add(first_child);
        first_child.dy(cur_shift + (chr_size[0] / 2 * (size === 0) +
                                    chr_size[1] / 2 * (size === 1) +
                                    chr_size[2] / 2 * (size >= 2)) * (cur_shift !== 0));
        delta += first_child.bbox().width;
        for (let i = 1; i < v.children.length; i++) {
            let tmp = interactive_text(v.value, v.cont, size);
            tmp.dx(delta);
            cur_cont.add(tmp);
            delta += tmp.bbox().width;
            let [another_child, cur_shift] = PrintTree(v.children[i], size);
            another_child.dx(delta);
            another_child.dy(cur_shift + (chr_size[0] / 2 * (size === 0) +
                                          chr_size[1] / 2 * (size === 1) +
                                          chr_size[2] / 2 * (size >= 2)) * (cur_shift !== 0));
            cur_cont.add(another_child);
            delta += another_child.bbox().width;
            cur_shift = 0;
        }
    } else if (v.children.length === 1) {
        let tmp = interactive_text(v.value + '(', v.cont, size);
        tmp.dx(delta);
        cur_cont.add(tmp);
        delta += tmp.bbox().width;
        let [child, cur_shift] = PrintTree(v.children[0], size);
        child.dx(delta);
        child.dy(cur_shift + (chr_size[0] / 2 * (size === 0) +
                              chr_size[1] / 2 * (size === 1) +
                              chr_size[2] / 2 * (size >= 2)) * (cur_shift !== 0));
        cur_cont.add(child);
        delta += child.bbox().width;
        tmp = interactive_text(')', v.cont, size);
        tmp.dx(delta);
        cur_cont.add(tmp);
    } else {
        let variable = interactive_text(v.value, v.cont, size);
        cur_cont.add(variable);
    }
    return [cur_cont, vert_shift];
}

let expr = PrintTree(TreeRoot, 0)[0];
expr.move(100, 100);

/*
let cont = app.group();
let cont1 = cont.group();
let cont2 = cont1.group();
let txt = interactive_text('Test', cont2, 0);
cont1.dmove(100, 100);
cont2.dy(-50);
txt.dy(-50);
*/
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
