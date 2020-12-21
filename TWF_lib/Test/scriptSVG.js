/*

PrintTree(TWF_v, init_font_size, app);

TWF_v - корень дерева из библиотеки TWF, которое надо отобразить
init_font_size - желаемый размер шрифта
app - SVG контейнер, в который надо поместить отрисованное дерево

Возвращает SVG контейнер, содержащий отрисованное интерактивное дерево
P.S. не надо добавлять возвращенный контейнер в app: это делается
автоматически в PrintTree



PlainPrintTree(TWF_v, init_font_size, app);

Делает то же самое, но дерево будет лишено интерактивности



initTestingGround(test_expr, font_size);

test_expr - structure_string строка, описывающая дерево для отрисовки
font_size - желаемый размер шрифта

Создает небольшую сцену, на которую отрисовывает дерево из test_expr

*/

//const test_string = "^(X;/(^(X;/(X;X));X))";
//initTestingGround(test_string, 100);

function initTestingGround(test_expr, font_size) {
    const background_colour = '#1F1F1F';
    const background_width = 800;
    const background_height = 800;

    const app = new SVG().addTo('body')
                         .size(background_width, background_height);
    app.viewbox(0, 0, background_width, background_height);
    app.rect(background_width, background_height).fill(background_colour);

    let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$(test_expr);
    let expr = PrintTree(NewTreeRoot, font_size, app);
    expr.move(0, 100);
}

function MakeNode(node, app) {
    this.value = node.value;
    this.children = [];
    this.add = function(child_node) {
        this.children.push(child_node);
    }
    this.cont = app.group();
    this.twfNode = node;
}

function MakeTree(node, app) {
    let cur_node = new MakeNode(node, app);
    for (let i = 0; i < node.children.size; i++) {
        cur_node.add(MakeTree(node.children.toArray()[i], app));
    }
    return cur_node;
}

function PrintTree(TWF_v, init_font_size, app) {
    let TreeRoot = MakeTree(TWF_v.children.toArray()[0], app);

    let chr_sample = SVG().text('X').font({size: init_font_size});
    const init_chr_size = chr_sample.bbox().height;
    chr_sample.remove();

    let min = Math.min;

    const default_text_colour = '#CCCCCC';
    const mouse_over_text_colour = '#AAAAAA';
    const mouse_down_text_colour = '#00FFFF';

    const font_size = [init_font_size,
        init_font_size / Math.sqrt(2),
        init_font_size / 2];
    const chr_size = [init_chr_size,
        init_chr_size / Math.sqrt(2),
        init_chr_size / 2];

    const max_size = 2;
    const inter_letter_interval = init_chr_size / 36;

    //fraction line
    const line_height = [chr_size[0] / 22.16,
        chr_size[1] / 19.6,
        chr_size[2] / 18.47];
    const line_elongation = init_chr_size / 3.7;

    const default_vert_shift_offset = [chr_size[0] / 2,
        chr_size[1] / 2,
        chr_size[2] / 2];

    const pow_vert_offset = chr_size[2] / 5;
    const pow_hitbox_width = [chr_size[1] / 2.5, chr_size[2] / 2.5];
    const pow_hitbox_height = [chr_size[1] / 2, chr_size[2] / 2];
    const pow_hitbox_vert_offset = [chr_size[1] / 8, chr_size[2] / 8];

    const log_sub_vert_offset = [chr_size[0] / 2,
        chr_size[1] / 2,
        chr_size[2] / 1.3];

    const combi_top_vert_offset = [chr_size[0] / 5,
        chr_size[1] / 5,
        chr_size[2] / 4];

    function interactive_text(value, cont, size) {
        let txt = cont.text(value).font({
            size: font_size[min(size, max_size)],
            family: 'u2000',
            fill: default_text_colour
        });
        txt.css('cursor', 'pointer');
        txt.css('user-select', 'none');
        txt.leading(0.9);
        txt
            .on('mousedown', () => onButtonDown(cont))
            .on('mouseup mouseover', () => onButtonOver(cont))
            .on('mouseout', () => onButtonOut(cont));
        return txt;
    }

    function Division(a, b, cont, size) {
        cont.add(a);
        cont.add(b);
        let width = Math.max(a.bbox().width, b.bbox().width) + line_elongation;
        let height = line_height[min(size - 1, max_size)];
        let line = cont.group().rect(width, height)
            .fill(default_text_colour)
            .move(a.bbox().x, a.bbox().y);
        line.css('cursor', 'pointer');
        line
            .on('mousedown', () => onButtonDown(cont))
            .on('mouseup mouseover', () => onButtonOver(cont))
            .on('mouseout', () => onButtonOut(cont));
        line.y(a.y() + a.bbox().height);
        b.y(a.y() + a.bbox().height + line.height());
        a.dx((line.width() - a.bbox().width) / 2);
        b.dx((line.width() - b.bbox().width) / 2);
        return a.bbox().height + line.height() / 3; //recommended vertical shift
                                            //to keep the fraction centered
    }

    function calculate_vert_shift(shift, size) {
        return shift + default_vert_shift_offset[min(size, max_size)];
    }

    function draw(cont, child, del) {
        child.dx(del);
        cont.add(child);
        return child.bbox().width;
    }

    function v_draw(cont, child, del, vert, size) {
        child.y(calculate_vert_shift(vert, size));
        return draw(cont, child, del);
    }

    function draw_with_brackets(cont, child, delta, shift, size) {
        let tmp = interactive_text("(", child, size);
        delta += draw(cont, tmp, delta) + inter_letter_interval;
        delta += v_draw(cont, child, delta, shift, size) + inter_letter_interval;
        tmp = interactive_text(")", child, size);
        delta += draw(cont, tmp, delta) + inter_letter_interval;
        return delta;
    }

    function recPrintTree(v, size) {
        let vert_shift = - default_vert_shift_offset[min(size, max_size)];
        let delta = 0;
        let cur_cont = v.cont;

        if (v.value === "/") {
            vert_shift = -Division(recPrintTree(v.children[0], size + 1)[0],
                recPrintTree(v.children[1], size + 1)[0],
                cur_cont, size + 1);

        } else if (v.value === "^") {
            let first_child, another_child, first_shift, another_shift;
            [first_child, first_shift] = recPrintTree(v.children[0], size);
            [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
            if (v.children[0].children.length > 0) {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, first_shift, size);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, first_shift, size) + inter_letter_interval;
            }
            v_draw(cur_cont, another_child, delta, another_shift, size + 1);
            another_child.y(first_child.y() - first_shift
                - another_child.bbox().height
                + pow_vert_offset * (size >=  2));
            let rect = cur_cont.group()
                .rect(pow_hitbox_width[min(size, max_size - 1)],
                    pow_hitbox_height[min(size, max_size - 1)])
                .move(another_child.bbox().x, another_child.bbox().y)
            rect.dy(another_child.bbox().height - rect.height()
                - pow_hitbox_vert_offset[min(size, max_size - 1)]);
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
            [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
            [another_child, another_shift] = recPrintTree(v.children[1], size);
            vert_shift = min(another_shift, vert_shift);
            delta += v_draw(cur_cont, first_child, delta, first_shift, size)
                + inter_letter_interval;
            first_child.y(tmp.y() + tmp.bbox().height
                - log_sub_vert_offset[min(size, max_size)]);
            if (v.children[1].children.length > 0) {
                draw_with_brackets(cur_cont, another_child,
                    delta, another_shift, size);
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
            [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
            [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
            v_draw(cur_cont, first_child, delta, first_shift, size);
            first_child.y(tmp.y() + tmp.bbox().height
                - default_vert_shift_offset[min(size, max_size)]);
            v_draw(cur_cont, another_child, delta, another_shift, size);
            another_child.y(tmp.y()
                - combi_top_vert_offset[min(size, max_size)]);
            if (another_child.y() + another_child.bbox().height > first_child.y()){
                another_child.dy(- another_child.y()
                    - another_child.bbox().height
                    + first_child.y());
            }
            vert_shift += cur_cont.bbox().y - tmp.bbox().y;

        } else if (v.value === "-") {
            let child, cur_shift, tmp;
            tmp = interactive_text("\u2212", cur_cont, size);
            delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
            [child, cur_shift] = recPrintTree(v.children[0], size)
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "-" ||
                v.children[0].value === "*" ||
                v.children[0].value === "+") {
                draw_with_brackets(cur_cont, child, delta, cur_shift, size);
            } else {
                v_draw(cur_cont, child, delta, cur_shift, size);
            }

        } else if (v.value === "+") {
            let first_child, another_child, cur_shift, tmp;
            [first_child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "+") {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, cur_shift, size);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, cur_shift, size) + inter_letter_interval;
            }
            for (let i = 1; i < v.children.length; i++) {
                if (v.children[i].value !== "-") {
                    tmp = interactive_text(v.value, cur_cont, size);
                    delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
                }
                [another_child, cur_shift] = recPrintTree(v.children[i], size);
                vert_shift = min(cur_shift, vert_shift);
                if (v.children[i].value === "+") {
                    delta = draw_with_brackets(cur_cont, another_child,
                        delta, cur_shift, size);
                } else {
                    delta += v_draw(cur_cont, another_child,
                        delta, cur_shift, size) + inter_letter_interval;
                }
            }


        } else if (v.value === "*") {
            let first_child, another_child, cur_shift, tmp;
            [first_child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "*" || v.children[0].value === "+") {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, cur_shift, size);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, cur_shift, size) + inter_letter_interval;
            }
            for (let i = 1; i < v.children.length; i++) {
                tmp = interactive_text("\u2219", cur_cont, size);
                delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
                [another_child, cur_shift] = recPrintTree(v.children[i], size);
                vert_shift = min(cur_shift, vert_shift);
                if (v.children[i].value === "*" || v.children[i].value === "+") {
                    delta = draw_with_brackets(cur_cont, another_child,
                        delta, cur_shift, size);
                } else {
                    delta += v_draw(cur_cont, another_child,
                        delta, cur_shift, size) + inter_letter_interval;
                }
            }

        } else if (v.value === "" ||
            v.value === "sin" ||
            v.value === "cos") {
            let child, cur_shift, tmp;
            [child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            tmp = interactive_text(v.value, cur_cont, size);
            delta += draw(cur_cont, tmp, delta) + inter_letter_interval;
            draw_with_brackets(cur_cont, child,
                               delta, cur_shift, size);

        } else {
            let variable = interactive_text(v.value, cur_cont, size);
            cur_cont.add(variable);
        }

        return [cur_cont, vert_shift];
    }

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

    return recPrintTree(TreeRoot, 0)[0];
}

function PlainPrintTree(TWF_v, init_font_size, app) {
    let expr = PrintTree(TWF_v, init_font_size, app);
    expr.flatten(expr);
    for (let item of expr.children()) {
        item.off();
        item.css('cursor', 'default');
    }
    return expr;
}