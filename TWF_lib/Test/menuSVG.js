
const testString = ["+(1;*(B;C))","+(2;*(4;5))","+(3;*(6;7))","+(4;*(8;9))","+(5;*(10;11))","+(6;*(12;126))"];

const chr_size = [110.8125, 78.421875, 55.21875];
MakeMainMenu(testString);

function MakeMainMenu(levelsList) {
    let app = new SVG().addTo('body').size(window.innerWidth, Math.max(100 * (levelsList.length), window.innerHeight));
    app.viewbox(0, 0, window.innerWidth,  Math.max(100 * (levelsList.length), window.innerHeight));
    app.rect(window.innerWidth,  Math.max(100 * (levelsList.length), window.innerHeight)).fill('#333938');
    let cont = app.group();

    function cleanMainMenu() {
        app.remove();
    }

    MakeLevelsButton (levelsList);
    function MakeLevelsButton(levelsList) {
        let heighContOfConts = 0;
        for (let i = 0; i < levelsList.length; ++i) {
            heighContOfConts += 80;
            let tmpCont = cont.group();
            let draw = tmpCont.group();

            tmpCont.add(interactive_button(draw));
            draw.rect(200, 80).radius(10)
                .fill('#517d73').center(window.innerWidth / 2, 100 * i + 100 / 2);

            draw.group().text(levelsList[i]).font({
                size: 50,
                family: 'u2000',
                fill: '#CCCCCC'
            }).center(window.innerWidth / 2, 100 * i + 100 / 2);
        }

    }


    function interactive_button(cont, f = false) {
        let tmp = cont;
        tmp.css('cursor', 'pointer');
        tmp
            .on('mousedown', (event) => onButtonDownButton(cont, f))
            .on('mouseup mouseover', (event) => onButtonOverButton(cont))
            .on('mouseout', (event) => onButtonOutButton(cont));
        return tmp;
    }

    function onButtonDownButton(con, f = false) {
        if (con.type == "text") {
            cleanMainMenu();
            MakeMenuOfLevel(con.text());
        }
        con.animate(300, '<>').fill('#ffbf00');
        for (let item of con.children()) {
            onButtonDownButton(item);
        }
        if (f) cleanMenuOfLevel();
    }

    function onButtonOverButton(con) {
        if (con.type == "text") return;
        con.animate(300, '<>').fill('#874141');
        for (let item of con.children()) {
            onButtonOverButton(item);
        }
    }

    function onButtonOutButton(con) {
        if (con.type == "text") return;
        con.animate(300, '<>').fill('#517d73');
        for (let item of con.children()) {
            onButtonOutButton(item);
        }
    }

    function ins(cont, x, y) {
        return (x >= cont.x()) && (y >= cont.y()) && (x <= cont.x() + width_cont) && (y <= cont.y() + height_cont);
    }
}

function MakeMenuOfLevel(level) {

    let app = new SVG().addTo('body').size(window.innerWidth, window.innerHeight);
    app.viewbox(0, 0, window.innerWidth, window.innerHeight);
    app.rect(window.innerWidth, window.innerHeight).fill('#333938');

    let contTree = app.nested();
    function MakeNode(node) {
        this.value = node.value;
        this.children = [];
        this.add = function(child_node) {
            this.children.push(child_node);
        }
        this.cont = contTree.nested();
        this.twfNode = node;
    }

    function MakeTree(node) {
        let cur_node = new MakeNode(node);
        for (let i = 0; i < node.children.size; i++) {
            cur_node.add(MakeTree(node.children.toArray()[i]));
        }
        return cur_node;
    }

    function MakeNewTree(node, cont){
        let ttt = cont.group()
        function MakeNode(node) {
            this.value = node.value;
            this.children = [];
            this.add = function(child_node) {
                this.children.push(child_node);
            }
            this.cont = ttt.nested();
            this.twfNode = node;
        }

        function MakeTree(node) {
            let cur_node = new MakeNode(node);
            for (let i = 0; i < node.children.size; i++) {
                cur_node.add(MakeTree(node.children.toArray()[i]));
            }
            return cur_node;
        }
        return MakeTree(node);
    }


    function interactive_text(value, cont, size, nodeId = -1) {
        let txt = cont.group().text(value).font({
            size: 100 * (size === 0) + 71 * (size === 1) + 50 * (size >= 2),
            family: 'u2000',
            fill: '#CCCCCC'
        });
        txt.css('cursor', 'pointer');
        txt.leading(0.9);
        txt
            .on('mousedown', (event) => onButtonDown(cont, nodeId))
            .on('mouseup mouseover', (event) => onButtonOver(cont))
            .on('mouseout', (event) => onButtonOut(cont));
        return txt;
    }

    let NewTreeRoot = TWF_lib.api.structureStringToExpression_69c2cy$(level);

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
                tmp = interactive_text("(", first_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, first_child, delta, first_shift, size) + 3;
                tmp = interactive_text(")", first_child, size, v.twfNode.nodeId);
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
            tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + 3;
            [first_child, first_shift] = PrintTree(v.children[0], size + 1);
            [another_child, another_shift] = PrintTree(v.children[1], size);
            vert_shift = Math.min(another_shift, vert_shift);
            delta += v_draw(cur_cont, first_child, delta, first_shift, size) + 3;
            first_child.y(tmp.y() + tmp.bbox().height - chr_size[0] / 2   * (size === 0)
                - chr_size[1] / 2   * (size === 1)
                - chr_size[2] / 1.3 * (size >=  2));
            if (v.children[1].children.length > 0) {
                tmp = interactive_text("(", another_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, another_child, delta, another_shift, size) + 3;
                tmp = interactive_text(")", another_child, size, v.twfNode.nodeId);
                draw(cur_cont, tmp, delta);
            } else {
                v_draw(cur_cont, another_child, delta, another_shift, size);
            }

        } else if ((v.value === "C" ||
            v.value === "A" ||
            v.value === "V" ||
            v.value === "U") && v.children.length === 2) {
            let first_child, another_child, first_shift, another_shift, tmp;
            tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
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
            tmp = interactive_text("\u2212", cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + 3;
            [child, cur_shift] = PrintTree(v.children[0], size)
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[0].value === "-" ||
                v.children[0].value === "*" ||
                v.children[0].value === "+") {
                tmp = interactive_text("(", child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, child, delta, cur_shift, size) + 3;
                tmp = interactive_text(")", child, size, v.twfNode.nodeId);
                draw(cur_cont, tmp, delta);
            } else {
                v_draw(cur_cont, child, delta, cur_shift, size);
            }

        } else if (v.value === "+") {
            let first_child, another_child, cur_shift, tmp;
            [first_child, cur_shift] = PrintTree(v.children[0], size);
            vert_shift = Math.min(cur_shift, vert_shift);
            if (v.children[0].value === "+") {
                tmp = interactive_text("(", first_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
                tmp = interactive_text(")", first_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
            } else {
                delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
            }
            for (let i = 1; i < v.children.length; i++) {
                if (v.children[i].value !== "-") {
                    tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
                    delta += draw(cur_cont, tmp, delta) + 3;
                }
                [another_child, cur_shift] = PrintTree(v.children[i], size);
                vert_shift = Math.min(cur_shift, vert_shift);
                if (v.children[i].value === "+") {
                    tmp = interactive_text("(", another_child, size, v.twfNode.nodeId);
                    delta += draw(cur_cont, tmp, delta) + 3;
                    delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
                    tmp = interactive_text(")", another_child, size, v.twfNode.nodeId);
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
                tmp = interactive_text('(', first_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
                tmp = interactive_text(')', first_child, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
            } else {
                delta += v_draw(cur_cont, first_child, delta, cur_shift, size) + 3;
            }
            for (let i = 1; i < v.children.length; i++) {
                tmp = interactive_text("\u2219", cur_cont, size, v.twfNode.nodeId);
                delta += draw(cur_cont, tmp, delta) + 3;
                [another_child, cur_shift] = PrintTree(v.children[i], size);
                vert_shift = Math.min(cur_shift, vert_shift);
                if (v.children[i].value === "*" || v.children[i].value === "+") {
                    tmp = interactive_text("(", another_child, size, v.twfNode.nodeId);
                    delta += draw(cur_cont, tmp, delta) + 3;
                    delta += v_draw(cur_cont, another_child, delta, cur_shift, size) + 3;
                    tmp = interactive_text(")", another_child, size, v.twfNode.nodeId);
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
            tmp = interactive_text(v.value + '(', cur_cont, size, v.twfNode.nodeId);
            delta += draw(cur_cont, tmp, delta) + 3;
            delta += v_draw(cur_cont, child, delta, cur_shift, size) + 3;
            tmp = interactive_text(')', cur_cont, size, v.twfNode.nodeId);
            draw(cur_cont, tmp, delta);

        } else {
            let variable = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
            cur_cont.add(variable);
        }

        return [cur_cont, vert_shift];
    }

    compiledConfiguration = TWF_lib.api.createCompiledConfigurationFromExpressionSubstitutionsAndParams_aatmta$(
        [TWF_lib.api.expressionSubstitutionFromStructureStrings_l8d3dq$(level, level)])

    function onButtonDown(con, nodeId, f = true) {
        con.animate(300, '<>').fill('#00FFFF');
        for (let item of con.children()) {
            onButtonDown(item, nodeId, false);
        }
        if (f) {
            let arr = (TWF_lib.api.findApplicableSubstitutionsInSelectedPlace_fe1uu9$(
                TWF_lib.api.structureStringToExpression_69c2cy$(level),
                [nodeId],
                compiledConfiguration)).toArray();
            var newarr = []
            for (let i = 0; i < arr.length; i++) {
                newarr.push([arr[i].originalExpressionChangingPart.toString(), arr[i].resultExpressionChangingPart.toString()])
            }
            MakeMenu(newarr, arr, [nodeId]);
        }
    }

    function onButtonOver(con) {
        con.animate(300, '<>').fill('#AAAAAA');
        for (let item of con.children()) {
            onButtonOver(item);
        }
    }

    function onButtonOut(con) {
        con.animate(300, '<>').fill('#CCCCCC');
        for (let item of con.children()) {
            onButtonOut(item);
        }
    }

//==========================================================



    let cont = app.nested();
    let height_cont = window.innerHeight / 5 * 2 - 60;
    let width_cont = window.innerWidth - 200;
    let height_inner_cont = height_cont / 4;
    let width_inner_cont = width_cont / 8 * 8;
    cont.size(width_cont, height_cont)
        .move(100 ,(window.innerHeight / 5 * 3))
        .rect(width_cont, height_cont)
        .fill('#9e5252').radius(10);
    let contOfconts = cont.group()


    function MakeMenu(listOfValues, arrSubs, idArr) {
        cont.size(width_cont, height_cont)
            .move(100 ,(window.innerHeight / 5 * 3))
            .rect(width_cont, height_cont)
            .fill('#9e5252').radius(10);
        contOfconts.remove();
        contOfconts = cont.group()


        let heighContOfConts = 0;
        for (let i = 0; i < listOfValues.length; ++i) {
            heighContOfConts += height_inner_cont;
            let tmpCont = contOfconts.group();
            let draw = tmpCont.group();

            tmpCont.add(interactive_button_1(draw, false, i));
            draw.rect(width_inner_cont, height_inner_cont).radius(10)
                .fill('#517d73').dy(height_inner_cont * i);
            tmpCont.add(PrintTree(MakeNewTree(TWF_lib.api.structureStringToExpression_69c2cy$(listOfValues[i][0])
                .children.toArray()[0], tmpCont), 5)[0].y(height_inner_cont * i ));
            let tmpx = tmpCont.width();
            tmpCont.add(interactive_text( "  \u27F6  ", tmpCont, 6)
                .y(height_inner_cont * i - 10).x(tmpx));
            tmpx = tmpCont.width();
            tmpCont.add(PrintTree(MakeNewTree(TWF_lib.api.structureStringToExpression_69c2cy$(listOfValues[i][1])
                .children.toArray()[0], tmpCont), 5)[0].y(height_inner_cont * i ).x(tmpx));

        }
        function movescrollup(con, tmp) {
            con.animate(10, '<>')
                .y(tmp * 7)
            if (con.y() > con.y() - 500) {
                con.animate(200, '<>').y(0);
            }

            // for (let item of con.children()) {
            //     movescrollup(con, tmp);
            // }
        }

        function movescrolldown(con, tmp) {
            con.animate(10, '<>')
                .y(tmp * 7);
            if (con.y() < cont.y() + height_cont - heighContOfConts - 160) {
                con.animate(200, '<>').y(height_cont - heighContOfConts);
            }

            // for (let item of con.children()) {
            //     movescrolldown(con, tmp);
            // }
        }

        contOfconts.on('scroll', function (e) {
            if (heighContOfConts < height_cont) return;
            //alert(cont.bbox().height);
            //alert(contOfconts.y());
            let tmp = e.detail.some;
            if (tmp > 0) {
                movescrollup(contOfconts, tmp);
            }
            else {
                movescrolldown(contOfconts, tmp);
            }
        });

        function addHandler(object, event, handler) {
            if (object.addEventListener) {
                object.addEventListener(event, handler, false);
            } else if (object.attachEvent) {
                object.attachEvent('on' + event, handler);
            } else alert("Обработчик не поддерживается");
        }

        addHandler(document, 'mousewheel', wheel);


        function onButtonDownButton1(con, f = false, index = -1) {
            con.animate(300, '<>').fill('#ffbf00');
            for (let item of con.children()) {
                onButtonDownButton1(item);
            }
            if (index != -1) {
                //alert(index);
                level = (TWF_lib.api.applySubstitutionInSelectedPlace_m5nb0p$(
                    TWF_lib.api.structureStringToExpression_69c2cy$(level),
                    idArr,
                    arrSubs[index].expressionSubstitution,
                    TWF_lib.api.createCompiledConfigurationFromExpressionSubstitutionsAndParams_aatmta$(
                        [TWF_lib.api.expressionSubstitutionFromStructureStrings_l8d3dq$(level, level)]),
                )).toString()
                //alert([level, typeof level])
                cleanMenuOfLevel(false, level);
            }
            if (f) cleanMenuOfLevel();
        }
        function interactive_button_1(cont, f = false, index = -1) {
            let tmp = cont;
            tmp.css('cursor', 'pointer');
            tmp
                .on('mousedown', (event) => onButtonDownButton1(cont, f, index))
                .on('mouseup mouseover', (event) => onButtonOverButton(cont))
                .on('mouseout', (event) => onButtonOutButton(cont));
            return tmp;
        }

    }
    function wheel(event) {
        let delta;
        event = event || window.event;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 120;
            if (window.opera) delta = -delta;
        } else if (event.detail) {
            delta = -event.detail / 3;
        }
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
        if (ins(cont, event.pageX, event.pageY)) {
            //alert([event.pageX, event.pageY]);
            contOfconts.fire('scroll', {some: delta})
        }
    }

    function onButtonDownButton(con, f = false) {
        con.animate(300, '<>').fill('#ffbf00');
        for (let item of con.children()) {
            onButtonDownButton(item);
        }
        if (f) cleanMenuOfLevel();
    }



    function interactive_button(cont, f = false, index = -1) {
        let tmp = cont;
        tmp.css('cursor', 'pointer');
        tmp
            .on('mousedown', (event) => onButtonDownButton(cont, f, index))
            .on('mouseup mouseover', (event) => onButtonOverButton(cont))
            .on('mouseout', (event) => onButtonOutButton(cont));
        return tmp;
    }



    function onButtonOverButton(con) {
        con.animate(300, '<>').fill('#874141');
        for (let item of con.children()) {
            onButtonOverButton(item);
        }
    }

    function onButtonOutButton(con) {

        con.animate(300, '<>').fill('#517d73');
        for (let item of con.children()) {
            onButtonOutButton(item);
        }
    }

    function ins(cont, x, y) {
        return (x >= cont.x()) && (y >= cont.y()) && (x <= cont.x() + width_cont) && (y <= cont.y() + height_cont);
    }

    function MakeInnerCont (cont) {
        this.draw = cont.group();
    }


    let expr = PrintTree(TreeRoot, 0)[0];
    expr.dx((window.innerWidth - expr.bbox().width) / 2);
    expr.dy(window.innerHeight / 5 * 2);


    let button_height = (window.innerHeight / 5  - 60) / 3 * 2;
    let button_width = (window.innerWidth - 200 - 30 * 4) / 5;

    let contOfButtones = app.group();

    let tmp = contOfButtones.group();

    tmp.size(button_width, button_height)
        .rect(button_width, button_height)
        .fill('#517d73').radius(10)
        .move(100 + 2 * (30 + button_width), 30 + (window.innerHeight / 5  - 60) / 3);

    //
    // let k = 0;
    // setInterval(tmp.group().text(String(k++)).font({
    //     size: 50,
    //     family: 'u2000',
    //     fill: '#CCCCCC'
    // }).move(100 + i * (30 + button_width), 30 + (window.innerHeight / 5  - 60) / 3), 1000);

    for (let i = 0; i < 5; ++i) {
        if (i == 2) continue;
        if (i == 3) {
            let goBackButton = contOfButtones.group();

            goBackButton.size(button_width, button_height)
                .rect(button_width / 2 - 15, button_height)
                .fill('#517d73').radius(10)
                .move(100 + i * (30 + button_width), 30 + (window.innerHeight / 5  - 60) / 3);

            contOfButtones.add(interactive_button(goBackButton, true));
            let goBackButton1 = contOfButtones.group();

            goBackButton1.size(button_width, button_height)
                .rect(button_width / 2 - 15, button_height)
                .fill('#517d73').radius(10)
                .move(100 + i * (30 + button_width) + (button_width / 2) + 15, 30 + (window.innerHeight / 5  - 60) / 3);

            contOfButtones.add(interactive_button(goBackButton1, true));
            continue;
        }
        let goBackButton = contOfButtones.group();

        goBackButton.size(button_width, button_height)
            .rect(button_width, button_height)
            .fill('#517d73').radius(10)
            .move(100 + i * (30 + button_width), 30 + (window.innerHeight / 5  - 60) / 3);

        contOfButtones.add(interactive_button(goBackButton, true));

    }

    function removeHandler(object, event, handler) {
        if (object.removeEventListener) {
            object.removeEventListener(event, handler, false);
        } else if (object.detachEvent) {
            object.detachEvent('on' + event, handler);
        } else alert("Remove handler is not supported");
    }


    function cleanMenuOfLevel(f = true, level = "") {
        removeHandler(document, 'mousewheel', wheel);
        contOfButtones.remove();
        contOfconts.remove();
        cont.remove();
        contTree.remove();
        contOfButtones.remove();
        app.remove();

        if (f) MakeMainMenu(testString);
        else MakeMenuOfLevel(level);
    }
}
