const background_colour = '#1F1F1F';
const background_width = 1000;
const background_height = 800;

const app = new SVG().addTo('body').size(background_width, background_height);
app.viewbox(0, 0, background_width, background_height);
app.rect(background_width, background_height).fill(background_colour);

const init_font_size = 100;                                // Change this to resize all printed text

let chr_sample = app.text('X').font({size: init_font_size});
const init_chr_size = chr_sample.bbox().height;
chr_sample.remove();

const default_text_colour = '#CCCCCC';
const mouse_over_text_colour = '#AAAAAA';
const mouse_down_text_colour = '#00FFFF';

const font_size = [init_font_size, init_font_size / Math.sqrt(2), init_font_size / 2];
const chr_size = [init_chr_size, init_chr_size / Math.sqrt(2), init_chr_size / 2];

const max_size = 2;
const inter_letter_interval = init_chr_size / 36;

const line_height = [chr_size[0] / 22.16, chr_size[1] / 19.6, chr_size[2] / 18.47];
const line_elongation = init_chr_size / 3.7;

const default_vert_shift_offset = [chr_size[0] / 2, chr_size[1] / 2, chr_size[2] / 2];

const pow_vert_offset = chr_size[2] / 5;
const pow_hitbox_width = [chr_size[1] / 2.5, chr_size[2] / 2.5];
const pow_hitbox_height = [chr_size[1] / 2, chr_size[2] / 2];
const pow_hitbox_vert_offset = [chr_size[1] / 8, chr_size[2] / 8];

const log_sub_index_vert_offset = [chr_size[0] / 2, chr_size[1] / 2, chr_size[2] / 1.3];

const combi_top_index_vert_offset = [chr_size[0] / 5, chr_size[1] / 5, chr_size[2] / 4];


const test_expr_x = 100;
const test_expr_y = 100;
const test_expr = "+(X;+(/(X;/(X;X))))";


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
        size: font_size[Math.min(size, max_size)],
        family: 'u2000',
        fill: default_text_colour
    });
    txt.css('cursor', 'pointer');
    txt.leading(0.9);
    txt
        .on('mousedown', () => onButtonDown(cont))
        .on('mouseup mouseover', () => onButtonOver(cont))
        .on('mouseout', () => onButtonOut(cont));
    return txt;
}

let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$(test_expr);

let TreeRoot = MakeTree(NewTreeRoot.children.toArray()[0]);

function Division(a, b, cont, size) {
    cont.add(a);
    cont.add(b);
    let width = Math.max(a.bbox().width, b.bbox().width) + line_elongation;
    let height = line_height[Math.min(size - 1, max_size)];
    let line = cont.group().rect(width, height)
                            .fill(default_text_colour)
                            .move(a.bbox().x, a.bbox().y);
    line.css('cursor', 'pointer');
    line
        .on('mousedown', () => onButtonDown(cont))
        .on('mouseup mouseover', () => onButtonOver(cont))
        .on('mouseout', () => onButtonOut(cont));
    line.dy(a.bbox().height);
    b.y(a.bbox().y + a.bbox().height + line.height());
    a.dx((line.width() - a.bbox().width) / 2);
    b.dx((line.width() - b.bbox().width) / 2);
    return a.bbox().height + line.height() / 3;            //recommended vertical shift to keep the fraction centered
}

function calculate_vert_shift(shift, size) {
    return shift + default_vert_shift_offset[Math.min(size, max_size)];
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

function draw_with_brackets(cont, child, delta, shift, size) {
    let tmp = interactive_text("(", child, size);
    delta += draw(cont, tmp, delta) + inter_letter_interval;
    delta += v_draw(cont, child, delta, shift, size) + inter_letter_interval;
    tmp = interactive_text(")", child, size);
    delta += draw(cont, tmp, delta) + inter_letter_interval;
    return delta;
}

function PrintTree(v, size) {
    let vert_shift = -default_vert_shift_offset[Math.min(size, max_size)];
    let delta = 0;
    let cur_cont = v.cont;

    if (v.value === "/") {
        vert_shift = -Division(PrintTree(v.children[0], size + 1)[0],
            PrintTree(v.children[1], size + 1)[0],
            cur_cont, size + 1);

    } else if (v.value === "^") {
        let first_child, another_child, first_shift, another_shift;
        [first_child, first_shift] = PrintTree(v.children[0], size);
        [another_child, another_shift] = PrintTree(v.children[1], size + 1);
        if (v.children[0].children.length > 0) {
            delta = draw_with_brackets(cur_cont, first_child, delta, first_shift, size);
        } else {
            delta += v_draw(cur_cont, first_child, delta, first_shift, size) + inter_letter_interval;
        }
        v_draw(cur_cont, another_child, delta, another_shift, size + 1);
        another_child.y(first_child.y() - first_shift - another_child.bbox().height + pow_vert_offset * (size >=  2));
        let rect = cur_cont.group()
            .rect(pow_hitbox_width[Math.min(size, max_size - 1)],
                  pow_hitbox_height[Math.min(size, max_size - 1)])
            .move(another_child.bbox().x, another_child.bbox().y)
        rect.dy(another_child.bbox().height - rect.height() - pow_hitbox_vert_offset[Math.min(size, max_size - 1)]);
        rect.dx(-rect.width() / 1.8);
        rect.css('cursor', 'pointer');
        rect
            .on('mousedown', () => onButtonDown(cur_cont))
            .on('mouseup mouseover', () => onButtonOver(cur_cont))
            .on('mouseout', () => onButtonOut(cur_cont));
        rect.opacity(0);
        vert_shift = cur_cont.bbox().y - first_child.bbox().y + first_shift;

    } else if (v.value === "log") {
        let first_child, another_child, first_shift, another_shift, tmp;
        tmp = interactive_text(v.value, cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
        [first_child, first_shift] = PrintTree(v.children[0], size + 1);
        [another_child, another_shift] = PrintTree(v.children[1], size);
        vert_shift = Math.min(another_shift, vert_shift);
        delta += v_draw(cur_cont, first_child, delta, first_shift, size) + inter_letter_interval;
        first_child.y(tmp.y() + tmp.bbox().height - log_sub_index_vert_offset[Math.min(size, max_size)]);
        if (v.children[1].children.length > 0) {
            draw_with_brackets(cur_cont, another_child, delta, another_shift, size);
        } else {
            v_draw(cur_cont, another_child, delta, another_shift, size);
        }

    } else if ((v.value === "C" ||
                v.value === "A" ||
                v.value === "V" ||
                v.value === "U") && v.children.length === 2) {
        let first_child, another_child, first_shift, another_shift, tmp;
        tmp = interactive_text(v.value, cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
        [first_child, first_shift] = PrintTree(v.children[0], size + 1);
        [another_child, another_shift] = PrintTree(v.children[1], size + 1);
        v_draw(cur_cont, first_child, delta, first_shift, size);
        first_child.y(tmp.y() + tmp.bbox().height - default_vert_shift_offset[Math.min(size, max_size)]);
        v_draw(cur_cont, another_child, delta, another_shift, size);
        another_child.y(tmp.y() - combi_top_index_vert_offset[Math.min(size, max_size)]);
        if (another_child.y() + another_child.bbox().height > first_child.y()) {
            another_child.dy(-another_child.y() - another_child.bbox().height + first_child.y());
        }
        vert_shift += cur_cont.bbox().y - tmp.bbox().y;

    } else if (v.value === "-") {
        let child, cur_shift, tmp;
        tmp = interactive_text("\u2212", cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
        [child, cur_shift] = PrintTree(v.children[0], size)
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "-" ||
            v.children[0].value === "*" ||
            v.children[0].value === "+") {
            draw_with_brackets(cur_cont, child, delta, cur_shift, size);
        } else {
            v_draw(cur_cont, child, delta, cur_shift, size);
        }

    } else if (v.value === "+") {
        let first_child, another_child, cur_shift, tmp;
        [first_child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "+") {
            delta = draw_with_brackets(cur_cont, first_child, delta, cur_shift, size);
        } else {
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + inter_letter_interval;
        }
        for (let i = 1; i < v.children.length; i++) {
            if (v.children[i].value !== "-") {
                tmp = interactive_text(v.value, cur_cont, size);
                delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
            }
            [another_child, cur_shift] = PrintTree(v.children[i], size);
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[i].value === "+") {
                delta = draw_with_brackets(cur_cont, another_child, delta, cur_shift, size);
            } else {
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + inter_letter_interval;
            }
        }


    } else if (v.value === "*") {
        let first_child, another_child, cur_shift, tmp;
        [first_child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        if (v.children[0].value === "*" || v.children[0].value === "+") {
            delta = draw_with_brackets(cur_cont, first_child, delta, cur_shift, size);
        } else {
            delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + inter_letter_interval;
        }
        for (let i = 1; i < v.children.length; i++) {
            tmp = interactive_text("\u2219", cur_cont, size);
            delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
            [another_child, cur_shift] = PrintTree(v.children[i], size);
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[i].value === "*" || v.children[i].value === "+") {
                delta = draw_with_brackets(cur_cont, another_child, delta, cur_shift, size);
            } else {
                delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + inter_letter_interval;
            }
        }

    } else if (v.value === "" ||
               v.value === "sin" ||
               v.value === "cos") {
        let child, cur_shift, tmp;
        [child, cur_shift] = PrintTree(v.children[0], size);
        vert_shift = Math.min(cur_shift, vert_shift);
        tmp = interactive_text(v.value + '(', cur_cont, size);
        delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
        delta += v_draw(cur_cont, child, delta, cur_shift, size) + inter_letter_interval;
        tmp = interactive_text(')', cur_cont, size);
        draw(cur_cont, tmp, delta);

    } else {
        let variable = interactive_text(v.value, cur_cont, size);
        cur_cont.add(variable);
    }

    return [cur_cont, vert_shift];
}

let expr = PrintTree(TreeRoot, 0)[0];
expr.move(test_expr_x, test_expr_y);

function onButtonDown(con) {
    con.fill(mouse_down_text_colour);
    for (let item of con.children()) {
        onButtonDown(item);
    }
}

function onButtonOver(con) {
    con.fill(mouse_over_text_colour);
    for (let item of con.children()) {
        onButtonOver(item);
    }
}

function onButtonOut(con) {
    con.fill(default_text_colour);
    for (let item of con.children()) {
        onButtonOut(item);
    }
}
