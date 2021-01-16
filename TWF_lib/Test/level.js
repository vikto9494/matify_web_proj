
const topButtonsLineHeight = 80;
const paddingFromTopButtonsLine = 80;
const centralExpressionSize = 80;

const substitutionAreaPadding = 100;
const substitutionAreaX = substitutionAreaPadding;
const substitutionAreaY = topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize + substitutionAreaPadding;
const substitutionAreaWidth = window.innerWidth - 2 * substitutionAreaPadding;
const substitutionAreaHeight = window.innerHeight - (topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize) - 2 * substitutionAreaPadding;
const substitutionSize = 50;

const substitutionAreaInternalPadding = 5;
const substitutionPaddingBetweenParts = 8;

const backgroundColour = "#efefef";
const defaultTextColor = "#254b25";
const defaultRulesBack = "#cfd8dc";
const highlightedRulesBack = '#bfc8cc';
const selectedRuleBack = '#ffbf00';

let height_inner_cont = substitutionAreaHeight / 4;
let width_inner_cont = substitutionAreaWidth / 8 * 8;

const originalExpression = "(+(2;+(2;*(4;5))))";
const endExpression = "(24)";

compiledConfiguration = TWF_lib.createCompiledConfigurationFromExpressionSubstitutionsAndParams(
    [TWF_lib.expressionSubstitutionFromStructureStrings("(+(a;b))", "(+(b;a))"),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "NumberPlusMinus1", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "DecimalToFraction", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "PowFactorization", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicationFactorization", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "OpeningBrackets", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ParentBracketsExpansion", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsSwap", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsPermutationInOther", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceArithmetic", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceFraction", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "AdditiveComplicatingExtension", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicativeComplicatingExtension", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MinusInOutBrackets", void 0, void 0),
            TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "SimpleComputation", void 0, void 0)])

init(compiledConfiguration, originalExpression, PrintSubstitutions, false, []);

let app = new SVG().addTo('body').size(window.innerWidth, window.innerHeight);

StartLevel(originalExpression);


function StartLevel(originalExpression)
{
        app.viewbox(0, 0, window.innerWidth, window.innerHeight);
        app.rect(window.innerWidth, window.innerHeight).fill(backgroundColour);

        let NewTreeRoot = TWF_lib.structureStringToExpression(originalExpression);
        expr = PrintTree(NewTreeRoot, centralExpressionSize, app);
        expr.center((window.innerWidth) / 2, topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize / 2);
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
                contOfCont.fire('scroll', {some: delta})
        }
}


function PrintSubstitutions(listOfValues, arrSubs) {
        rulesContainer = app.group();
        rulesContainer.rect(substitutionAreaWidth, substitutionAreaHeight)
            .move(substitutionAreaX, substitutionAreaY)
            .fill(backgroundColour).radius(10);


        let heighContOfConts = substitutionAreaY;
        for (let i = 0; i < listOfValues.length; ++i) {

                console.log(listOfValues[i][0]);
                console.log(listOfValues[i][1]);
                console.log("---");

                let tmpCont = rulesContainer.group();

                let draw = tmpCont.group();

                tmpCont.add(interactive_button_1(draw, false, i));


                let curCont = draw.group();

                let actualShiftX = substitutionAreaInternalPadding + substitutionAreaX;
                let lolkek = (PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][0]), substitutionSize, curCont)).x(actualShiftX).y(heighContOfConts);
                actualShiftX += substitutionPaddingBetweenParts;

                let tmpWidth = curCont.width();

                let arrowRight = curCont.group().text("\u27F6").font({
                        size: substitutionSize,
                        family: 'u2000',
                        fill: defaultTextColor
                }).x(actualShiftX + tmpWidth).y(height_inner_cont * i);

                actualShiftX += substitutionPaddingBetweenParts;
                tmpWidth = curCont.width();

                let abs = (PlainPrintTree(TWF_lib.structureStringToExpression(listOfValues[i][1]), substitutionSize, curCont)).x(actualShiftX + tmpWidth).y(heighContOfConts);

                lolkek.center(lolkek.x() + lolkek.width() / 2, heighContOfConts + abs.height() / 2);
                arrowRight.y(lolkek.y())
                draw.rect(width_inner_cont, curCont.height()).radius(10)
                    .fill(defaultRulesBack).x(substitutionAreaX).y(heighContOfConts);


                draw.add(curCont);


                heighContOfConts += curCont.height() + substitutionAreaInternalPadding;
        }

        function moveScrollUp(con, tmp) {
                con.animate(300, '<>')
                    .dy(tmp * 2)
                if (con.y() > contOfCont.y() - 500) {
                        con.animate(300, '<>').y(0);
                }
        }

        function moveScrollDown(con, tmp) {
                con.animate(300, '<>')
                    .dy(tmp * 2);
                if (con.y() < cont.y() + height_cont - heighContOfConts) {
                        con.animate(300, '<>').y(height_cont - heighContOfConts);
                }
        }

        contOfCont.on('scroll', function (e) {
                if (heighContOfConts < height_cont) return;
                let tmp = e.detail.some;
                if (tmp > 0) {
                        moveScrollUp(contOfCont, tmp);
                } else {
                        moveScrollDown(contOfCont, tmp);
                }
        });

        function addHandler(object, event, handler) {
                if (object.addEventListener) {
                        object.addEventListener(event, handler, false, {passive: false});
                } else if (object.attachEvent) {
                        object.attachEvent('on' + event, handler, {passive: false});
                } else alert("Обработчик не поддерживается");
        }

        addHandler(document, 'mousewheel', wheel);


        function onButtonDownButton1(con, f = false, index = -1) {
                if (con.width() === width_inner_cont)
                        con.animate(300, '<>').fill(selectedRuleBack);
                for (let item of con.children()) {
                        onButtonDownButton1(item);
                }
                if (index !== -1) {
                        currentExpression = arrSubs[index].resultExpression.toString();
                        if (currentExpression === endExpression) {
                                cleanMenuOfLevel('win');
                                return;
                        }
                        StartLevel(currentExpression);
                }
                if (f) cleanMenuOfLevel('main');
        }


        function onButtonOverButton1(con) {
                if (con.width() === width_inner_cont)
                        con.animate(300, '<>').fill(highlightedRulesBack);
                for (let item of con.children()) {
                        onButtonOverButton1(item);
                }
        }

        function onButtonOutButton1(con) {
                if (con.width() === width_inner_cont)
                        con.animate(300, '<>').fill(defaultRulesBack);
                for (let item of con.children()) {
                        onButtonOutButton1(item);
                }
        }

        function interactive_button_1(cont, f = false, index = -1) {
                let tmp = cont;
                tmp.css('cursor', 'pointer');
                tmp
                    .on('mousedown', () => onButtonDownButton1(cont, f, index))
                    .on('mouseup mouseover', () => onButtonOverButton1(cont))
                    .on('mouseout', () => onButtonOutButton1(cont));
                return tmp;
        }
}