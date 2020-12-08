const app = new SVG().addTo('body').size(1000, 800);
app.viewbox(0, 0, 1000, 800);
app.rect(1000, 800).fill('#1F1F1F');
const chr_size = [110.8125, 78.421875, 55.21875];

function MakeNode(node) {
    this.value = node.value;
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
    let txt = cont.group().text(value).font({
        size: 100 * (size === 0) + 71 * (size === 1) + 50 * (size >= 2),
        family: 'u2000',
        fill: '#CCCCCC'
    });
    txt.css('cursor', 'pointer');
    txt.leading(0.9);
    txt
        .on('mousedown', (event) => onButtonDown(cont))
        .on('mouseup mouseover', (event) => onButtonOver(cont))
        .on('mouseout', (event) => onButtonOut(cont));
    return txt;
}

let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$("*(C(n;+(k;-(1)));C(n;/(k;2)))");

let TreeRoot = MakeTree(NewTreeRoot.children.toArray()[0]);

function Division(a, b, cont, size) {
    cont.add(a);
    cont.add(b);
    let width = Math.max(a.bbox().width, b.bbox().width) + 30;
    let height = 5 * (size === 1) +
                 4 * (size === 2) +
                 3 * (size >=  3);
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

function calculate_vert_shift(shift, size) {
    return (shift +  chr_size[0] / 2 * (size === 0) +
                     chr_size[1] / 2 * (size === 1) +
                     chr_size[2] / 2 * (size >=  2));
}

function draw(cont, child, del) {
    child.dx(del);
    cont.add(child);
    return child.bbox().width;
}

function v_draw(cont, child, del, vert, size) {
    child.dx(del);
    child.y(calculate_vert_shift(vert, size));
    cont.add(child);
    return child.bbox().width;
}

function PrintTree(v, size) {
    let vert_shift = - chr_size[0] / 2 * (size === 0)
                     - chr_size[1] / 2 * (size === 1)
                     - chr_size[2] / 2 * (size >=  2);
    let delta = 0;
    let cur_cont = v.cont;

    if (v.value === "/") {
        vert_shift = -Division(PrintTree(v.children[0], size + 1)[0],
            PrintTree(v.children[1], size + 1)[0],
            cur_cont, size + 1);

    } else if (v.value === "^") {
        let first_child, another_child, first_shift, another_shift, tmp;
        [first_child, first_shift] = PrintTree(v.children[0], size);
        [another_child, another_shift] = PrintTree(v.children[1], size + 1);
        if (v.children[0].children.length > 0) {
            tmp = interactive_text("(", first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, first_child, delta, first_shift, size) + 3;
            tmp = interactive_text(")", first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
        } else {
            delta += v_draw(cur_cont, first_child, delta, first_shift, size) + 3;
        }
        v_draw(cur_cont, another_child, delta, another_shift, size + 1);
        another_child.y(first_child.y() - first_shift - another_child.bbox().height + chr_size[2] * 0.2 * (size >=  2));
        let rect = cur_cont.group()
            .rect(chr_size[1] / 2.5 * (size === 0) +
                  chr_size[2] / 2.5 * (size >=  1),
                  chr_size[1] / 2   * (size === 0) +
                  chr_size[2] / 2   * (size >=  1))
            .move(another_child.bbox().x, another_child.bbox().y)
        rect.dy(another_child.bbox().height - rect.height() - chr_size[1] / 8 * (size === 0) -
                                                              chr_size[2] / 8 * (size >=  1));
        rect.dx(-rect.width() / 1.8);
        rect.css('cursor', 'pointer');
        rect
            .on('mousedown', (event) => onButtonDown(cur_cont))
            .on('mouseup mouseover', (event) => onButtonOver(cur_cont))
            .on('mouseout', (event) => onButtonOut(cur_cont));
        rect.opacity(0);
        vert_shift = cur_cont.bbox().y - first_child.bbox().y + first_shift;

    } else if (v.value === "log") {
        let first_child, another_child, first_shift, another_shift, tmp;
        tmp = interactive_text(v.value, cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + 3;
        [first_child, first_shift] = PrintTree(v.children[0], size + 1);
        [another_child, another_shift] = PrintTree(v.children[1], size);
        vert_shift = Math.min(another_shift, vert_shift);
        delta += v_draw(cur_cont, first_child, delta, first_shift, size) + 3;
        first_child.y(tmp.y() + tmp.bbox().height - chr_size[0] / 2   * (size === 0)
                                                  - chr_size[1] / 2   * (size === 1)
                                                  - chr_size[2] / 1.3 * (size >=  2));
        if (v.children[1].children.length > 0) {
            tmp = interactive_text("(", another_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, another_child, delta, another_shift, size) + 3;
            tmp = interactive_text(")", another_child, size);
            draw(cur_cont, tmp, delta);
        } else {
            v_draw(cur_cont, another_child, delta, another_shift, size);
        }

    } else if ((v.value === "C" ||
                v.value === "A" ||
                v.value === "V" ||
                v.value === "U") && v.children.length === 2) {
        let first_child, another_child, first_shift, another_shift, tmp;
        tmp = interactive_text(v.value, cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + 3;
        [first_child, first_shift] = PrintTree(v.children[0], size + 1);
        [another_child, another_shift] = PrintTree(v.children[1], size + 1);
        v_draw(cur_cont, first_child, delta, first_shift, size);
        first_child.y(tmp.y() + tmp.bbox().height - chr_size[0] / 2 * (size === 0)
                                                  - chr_size[1] / 2 * (size === 1)
                                                  - chr_size[2] / 2 * (size >= 2));
        v_draw(cur_cont, another_child, delta, another_shift, size);
        another_child.y(tmp.y() - chr_size[0] * 0.2 * (size === 0)
                                - chr_size[1] * 0.2 * (size === 1)
                                - chr_size[2] * 0.2 * (size >= 2));
        if (another_child.y() + another_child.bbox().height > first_child.y()) {
            another_child.dy(-another_child.y() - another_child.bbox().height + first_child.y());
        }
        vert_shift += cur_cont.bbox().y - tmp.bbox().y;

    } else if (v.value === "-") {
        let child, cur_shift, tmp;
        tmp = interactive_text("\u2212", cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + 3;
        [child, cur_shift] = PrintTree(v.children[0], size)
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "-" ||
            v.children[0].value === "*" ||
            v.children[0].value === "+") {
            tmp = interactive_text("(", child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, child, delta, cur_shift, size) + 3;
            tmp = interactive_text(")", child, size);
            draw(cur_cont, tmp, delta);
        } else {
            v_draw(cur_cont, child, delta, cur_shift, size);
        }

    } else if (v.value === "+") {
        let first_child, another_child, cur_shift, tmp;
        [first_child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "+") {
            tmp = interactive_text("(", first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
            tmp = interactive_text(")", first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
        } else {
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
        }
        for (let i = 1; i < v.children.length; i++) {
            if (v.children[i].value !== "-") {
                tmp = interactive_text(v.value, cur_cont, size);
                delta += draw(cur_cont, tmp, delta) + 3;
            }
            [another_child, cur_shift] = PrintTree(v.children[i], size);
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[i].value === "+") {
                tmp = interactive_text("(", another_child, size);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
                tmp = interactive_text(")", another_child, size);
                delta += draw(cur_cont, tmp, delta) + 3;
            } else {
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
            }
        }


    } else if (v.value === "*") {
        let first_child, another_child, cur_shift, tmp;
        [first_child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "*" || v.children[0].value === "+") {
            tmp = interactive_text('(', first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
            tmp = interactive_text(')', first_child, size);
            delta += draw(cur_cont, tmp, delta) + 3;
        } else {
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
        }
        for (let i = 1; i < v.children.length; i++) {
            tmp = interactive_text("\u2219", cur_cont, size);
            delta += draw(cur_cont, tmp, delta) + 3;
            [another_child, cur_shift] = PrintTree(v.children[i], size);
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[i].value === "*" || v.children[i].value === "+") {
                tmp = interactive_text("(", another_child, size);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
                tmp = interactive_text(")", another_child, size);
                delta += draw(cur_cont, tmp, delta) + 3;
            } else {
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
            }
        }

    } else if (v.value === "" ||
               v.value === "sin" ||
               v.value === "cos") {
        let child, cur_shift, tmp;
        [child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        tmp = interactive_text(v.value + '(', cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + 3;
        delta += v_draw(cur_cont, child, delta, cur_shift, size) + 3;
        tmp = interactive_text(')', cur_cont, size);
        draw(cur_cont, tmp, delta);

    } else {
        let variable = interactive_text(v.value, cur_cont, size);
        cur_cont.add(variable);
    }

    return [cur_cont, vert_shift];
}

let expr = PrintTree(TreeRoot, 0)[0];
expr.move(100, 100);

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
