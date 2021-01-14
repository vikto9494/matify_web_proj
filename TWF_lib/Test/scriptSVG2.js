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

//const test_string = "^(A;^(/(/(/(C;D);D);D);B))";
//initTestingGround(test_string, 100);


let compiledConfiguration;
let level;

function MakeMenu() {
}

let multiFlag = false;
let multiArr = [];
let multiArrCont = [];

function changeMultipleFlag(x) {
    if (!x) {
        multiArr = [];
        multiArrCont = [];
    }
}

function init(_compiledConfiguration, _level, _MakeMenu, _flag) {
    compiledConfiguration = _compiledConfiguration;
    level = _level;
    MakeMenu = _MakeMenu;
    multiFlag = _flag;
    multiArr = [];
    multiArrCont = [];
}

function initTestingGround(test_expr, font_size) {
    const background_colour = "#1F1F1F";
    const background_width = 800;
    const background_height = 800;

    const app = new SVG().addTo("body")
        .size(background_width, background_height);
    app.viewbox(0, 0, background_width, background_height);
    app.rect(background_width, background_height).fill(background_colour);

    let NewTreeRoot = TWF_lib.structureStringToExpression(test_expr);
    let expr = PrintTree(NewTreeRoot, font_size, app);
    expr.move(0, 100);
}

function MakeNode(node, app) {
    this.value = node.value;
    this.children = [];
    this.add = function (child_node) {
        this.children.push(child_node);
    }
    this.cont = app.group();
    this.twfNode = node;
    this.cont.addClass("uncolored");
}

function MakeTree(node, app) {
    let cur_node = new MakeNode(node, app);
    for (let i = 0; i < node.children.size; i++) {
        cur_node.add(MakeTree(node.children.toArray()[i], app));
    }
    return cur_node;
}

const default_text_color = "#CCCCCC";

function getColor(n) {
    let color = new SVG.Color("#448fff").to("#ff0000");
    return color.at(2 / (n + 2)).toHex();
}

function recolor(index) {
    for (let i = index; i < multiArr.length; ++i) {
        changeColor(multiArrCont[i], multiArrCont[i].classes()[0], `colored${multiArr[i]}`, getColor(i));
    }
}

function changeColor(con, fromClass, toClass, toColor) {
    if (!con.hasClass(fromClass))
        return;
    con.animate(300, "<>").fill(toColor);
    con.removeClass(fromClass);
    con.addClass(toClass);
    for (let item of con.children()) {
        changeColor(item, fromClass, toClass, toColor);
    }
}

function PrintTree(TWF_v, init_font_size, app) {
    let TreeRoot = MakeTree(TWF_v.children.toArray()[0], app);

    let chr_sample = SVG().text("X").font({size: init_font_size});
    const init_chr_size = chr_sample.bbox().height;
    chr_sample.remove();

    let min = Math.min;



    const font_size = [init_font_size,
        init_font_size / Math.sqrt(2),
        init_font_size / 2];
    const chr_size = [init_chr_size,
        init_chr_size / Math.sqrt(2),
        init_chr_size / 2];

    const max_size = 2;
    const interletter_interval = init_chr_size / 36;

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

    function interactive_text(value, cont, size, nodeId = -1) {
        let txt = cont.text(value).font({
            size: font_size[min(size, max_size)],
            family: "u2000",
            fill: default_text_color
        });
        txt.css("cursor", "pointer");
        txt.css("user-select", "none");
        txt.leading(0.9);
        txt
            .on("mousedown", () => onButtonDown(cont, nodeId))
            .on("mouseup mouseover", () => onButtonOver(cont, nodeId))
            .on("mouseout", () => onButtonOut(cont, nodeId));
        txt.addClass("uncolored");
        return txt;
    }

    function Division(a, b, cont, size, nodeId) {
        cont.add(a);
        cont.add(b);
        let width = Math.max(a.bbox().width, b.bbox().width) + line_elongation;
        let height = line_height[min(size - 1, max_size)];
        let line = cont.rect(width, height)
            .fill(default_text_color)
            .move(a.bbox().x, a.y() + a.bbox().height);
        line.addClass("uncolored");
        cont.add(line);

        let line_hitbox = cont.rect(width, height * 5)
            .move(line.x(), line.y() - height * 2);
        line_hitbox.css("cursor", "pointer");
        line_hitbox
            .on("mousedown", () => onButtonDown(cont, nodeId))
            .on("mouseup mouseover", () => onButtonOver(cont))
            .on("mouseout", () => onButtonOut(cont));
        line_hitbox.opacity(0);

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

    function draw_with_brackets(cont, child, delta, shift, size, nodeId) {
        let tmp = interactive_text("(", child, size, nodeId);
        delta += draw(cont, tmp, delta) + interletter_interval;
        delta += v_draw(cont, child, delta, shift, size) + interletter_interval;
        tmp = interactive_text(")", child, size, nodeId);
        delta += draw(cont, tmp, delta) + interletter_interval;
        return delta;
    }

    function recPrintTree(v, size) {
        let vert_shift = -default_vert_shift_offset[min(size, max_size)];
        let delta = 0;
        let cur_cont = v.cont;

        if (v.value === "/") {
            vert_shift = -Division(recPrintTree(v.children[0], size + 1)[0],
                recPrintTree(v.children[1], size + 1)[0],
                cur_cont, size + 1, v.twfNode.nodeId);

        } else if (v.value === "^") {
            let first_child, another_child, first_shift, another_shift;
            [first_child, first_shift] = recPrintTree(v.children[0], size);
            [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
            if (v.children[0].children.length > 0) {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, first_shift, size, v.children[0].twfNode.nodeId);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, first_shift, size) + interletter_interval;
            }
            v_draw(cur_cont, another_child, delta, another_shift, size + 1);
            another_child.y(first_child.y() - first_shift
                - another_child.bbox().height
                + pow_vert_offset * (size >= 2));
            let pow_hitbox = cur_cont
                .rect(pow_hitbox_width[min(size, max_size - 1)],
                    pow_hitbox_height[min(size, max_size - 1)])
                .move(another_child.bbox().x, another_child.bbox().y)
            pow_hitbox.dy(another_child.bbox().height - pow_hitbox.height()
                - pow_hitbox_vert_offset[min(size, max_size - 1)]);
            pow_hitbox.dx(-pow_hitbox.width() / 1.8);
            pow_hitbox.css("cursor", "pointer");
            pow_hitbox
                .on("mousedown", () => onButtonDown(cur_cont, v.twfNode.nodeId))
                .on("mouseup mouseover", () => onButtonOver(cur_cont))
                .on("mouseout", () => onButtonOut(cur_cont));
            pow_hitbox.opacity(0);
            vert_shift = cur_cont.bbox().y - first_child.bbox().y + first_shift;

        } else if (v.value === "log") {
            let first_child, another_child, first_shift, another_shift, tmp;
            tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + interletter_interval;
            [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
            [another_child, another_shift] = recPrintTree(v.children[1], size);
            vert_shift = min(another_shift, vert_shift);
            delta += v_draw(cur_cont, first_child, delta, first_shift, size)
                + interletter_interval;
            first_child.y(tmp.y() + tmp.bbox().height
                - log_sub_vert_offset[min(size, max_size)]);
            if (v.children[1].children.length > 0) {
                draw_with_brackets(cur_cont, another_child,
                    delta, another_shift, size, v.children[1].twfNode.nodeId);
            } else {
                v_draw(cur_cont, another_child, delta, another_shift, size);
            }

        } else if ((v.value === "C" ||
            v.value === "A" ||
            v.value === "V" ||
            v.value === "U") && v.children.length === 2) {
            let first_child, another_child, first_shift, another_shift, tmp;
            tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + interletter_interval;
            [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
            [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
            v_draw(cur_cont, first_child, delta, first_shift, size);
            first_child.y(tmp.y() + tmp.bbox().height
                - default_vert_shift_offset[min(size, max_size)]);
            v_draw(cur_cont, another_child, delta, another_shift, size);
            another_child.y(tmp.y()
                - combi_top_vert_offset[min(size, max_size)]);
            if (another_child.y() + another_child.bbox().height > first_child.y()) {
                another_child.dy(-another_child.y()
                    - another_child.bbox().height
                    + first_child.y());
            }
            vert_shift += cur_cont.bbox().y - tmp.bbox().y;

        } else if (v.value === "-") {
            let child, cur_shift, tmp;
            tmp = interactive_text("\u2212", cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + interletter_interval;
            [child, cur_shift] = recPrintTree(v.children[0], size)
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "-" ||
                v.children[0].value === "*" ||
                v.children[0].value === "+") {
                draw_with_brackets(cur_cont, child,
                    delta, cur_shift, size, v.children[0].twfNode.nodeId);
            } else {
                v_draw(cur_cont, child, delta, cur_shift, size);
            }

        } else if (v.value === "+") {
            let first_child, another_child, cur_shift, tmp;
            [first_child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "+") {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, cur_shift, size, v.children[0].twfNode.nodeId);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, cur_shift, size) + interletter_interval;
            }
            for (let i = 1; i < v.children.length; i++) {
                if (v.children[i].value !== "-") {
                    tmp = interactive_text(v.value, cur_cont,
                        size, v.twfNode.nodeId);
                    delta += draw(cur_cont, tmp, delta) + interletter_interval;
                }
                [another_child, cur_shift] = recPrintTree(v.children[i], size);
                vert_shift = min(cur_shift, vert_shift);
                if (v.children[i].value === "+") {
                    delta = draw_with_brackets(cur_cont, another_child,
                        delta, cur_shift, size, v.children[i].twfNode.nodeId);
                } else {
                    delta += v_draw(cur_cont, another_child,
                        delta, cur_shift, size) + interletter_interval;
                }
            }


        } else if (v.value === "*") {
            let first_child, another_child, cur_shift, tmp;
            [first_child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            if (v.children[0].value === "*" || v.children[0].value === "+") {
                delta = draw_with_brackets(cur_cont, first_child,
                    delta, cur_shift, size, v.children[0].twfNode.nodeId);
            } else {
                delta += v_draw(cur_cont, first_child,
                    delta, cur_shift, size) + interletter_interval;
            }
            for (let i = 1; i < v.children.length; i++) {
                tmp = interactive_text("\u2219", cur_cont,
                    size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + interletter_interval;
                [another_child, cur_shift] = recPrintTree(v.children[i], size);
                vert_shift = min(cur_shift, vert_shift);
                if (v.children[i].value === "*" || v.children[i].value === "+") {
                    delta = draw_with_brackets(cur_cont, another_child,
                        delta, cur_shift, size, v.children[i].twfNode.nodeId);
                } else {
                    delta += v_draw(cur_cont, another_child,
                        delta, cur_shift, size) + interletter_interval;
                }
            }

        } else if (v.value === "" ||
            v.value === "sin" ||
            v.value === "cos") {
            let child, cur_shift, tmp;
            [child, cur_shift] = recPrintTree(v.children[0], size);
            vert_shift = min(cur_shift, vert_shift);
            tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + interletter_interval;
            draw_with_brackets(cur_cont, child,
                delta, cur_shift, size, v.children[0].twfNode.nodeId);

        } else {
            let variable = interactive_text(v.value, cur_cont,
                size, v.twfNode.nodeId);
            cur_cont.add(variable);
        }

        return [cur_cont, vert_shift];
    }

    function onButtonDown(con, nodeId) {
        let index = multiArr.indexOf(nodeId);
        if (index !== -1) {
            multiArrCont.splice(index, 1);
            multiArr.splice(index, 1);
            if (con.parent().hasClass("uncolored") || con.parent().classes().length === 0) {
                changeColor(con, con.classes()[0], "uncolored", default_text_color);
            } else {
                changeColor(con, con.classes()[0], con.parent().classes()[0], getColor(multiArrCont.indexOf(con.parent())));
            }
            recolor(index);
        } else {
            multiArr.unshift(nodeId);
            multiArrCont.unshift(con);
            recolor(0);
            /*
            multiArr.push(nodeId);
            multiArrCont.push(con);
            recolor(multiArr.length - 1);
            */
        }

        let arr = []
        if (multiArr.length !== 0) {
            arr = (TWF_lib.findApplicableSubstitutionsInSelectedPlace(
                TWF_lib.structureStringToExpression(level),
                multiArr,
                compiledConfiguration)).toArray();
        }
        let new_arr = []
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].resultExpression.toString() === "To get application result use argument 'withReadyApplicationResult' = 'true'()") continue;
            new_arr.push([arr[i].originalExpressionChangingPart.toString(), arr[i].resultExpressionChangingPart.toString()])
        }
        MakeMenu(new_arr, arr);
    }


    function onButtonOver(con) {
        con.animate(300, "<>").attr( {opacity: 0.5} );
    }

    function onButtonOut(con) {
        con.animate(300, "<>").attr( {opacity: 1} );
    }

    return recPrintTree(TreeRoot, 0)[0];
}

function PlainPrintTree(TWF_v, init_font_size, app) {
    let expr = PrintTree(TWF_v, init_font_size, app);
    expr.flatten(expr);
    for (let item of expr.children()) {
        item.off();
        //item.css("cursor", "default");
    }
    return expr;
}
