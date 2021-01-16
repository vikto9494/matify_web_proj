package mainpoints

import expressiontree.ParserError
import factstransformations.*
import logs.MessageType
import logs.log
import standartlibextensions.readOpenTagStringIfItPresent
import standartlibextensions.remainingExpressionStartsWith
import standartlibextensions.selectPlacesForColoringByFragment
import visualization.brushMathMl
import visualization.dropPerformedMathMLBrushing
import visualization.setBackgroundColorMathMl


fun checkFactsInMathML(
        brushedMathML: String,
        wellKnownFunctions: String = "+$configSeparator-1$configSeparator-$configSeparator-1$configSeparator*$configSeparator-1$configSeparator/$configSeparator-1", //functions, which null-weight transformations allowed (if no other transformations), split by configSeparator
        expressionTransformationRules: String = "S(i, a, a, f(i))${configSeparator}f(a)${configSeparator}S(i, a, b, f(i))${configSeparator}S(i, a, b-1, f(i)) + f(b)", //function transformation rules, parts split by configSeparator; if it equals " " then expressions will be checked only by testing
        targetFactIdentifier: String = "", //Fact that learner need to prove should be here
//        targetFactPattern: String = "", //Pattern that specify criteria that learner's answer must meet    TODO: refactor this file and switch logic to matching by pattern
        targetVariablesNames: String = "", //Variables expressions for which learner need to deduce, split by configSeparator
        minNumberOfMultipliersInAnswer: String = "", //For factorization tasks
        maxNumberOfDivisionsInAnswer: String = "", //For fraction reducing tasks
        additionalFactsIdentifiers: String = "", ///Identifiers split by configSeparator - task condition facts should be here
        maxExpressionTransformationWeight: String = "1.0",
        unlimitedWellKnownFunctions: String = wellKnownFunctions, //functions, which null-weight transformations allowed with any other transformations, split by configSeparator
        shortErrorDescription: String = "0", //crop parsed steps from error description
        taskContextExpressionTransformationRules: String = "", //for expression transformation rules based on variables
        allowedVariablesNames: String = "", //Variables expressions for which learner need to deduce, split by configSeparator
        maxDistBetweenDiffSteps: String = "", //is it allowed to differentiate expression in one step
        forbiddenFunctions: String = "", //functions cannot been used in answer
        scopeFilter: String = "" //subject scopes which user representation sings is used
): String {
    log.clear()
    val compiledConfiguration = compiledConfigurationBySettings(
            wellKnownFunctions,
            expressionTransformationRules,
            maxExpressionTransformationWeight,
            unlimitedWellKnownFunctions,
            taskContextExpressionTransformationRules,
            maxDistBetweenDiffSteps,
            scopeFilter)
    log.factConstructorViewer = FactConstructorViewer(compiledConfiguration)
    log.addMessage({ "input transformations in mathML: '''$brushedMathML'''" }, level = 0)
    val mathMLWithoutUnexpectedCodes = replaceSpaceMathMLAliases(brushedMathML)
    val mathMLWithoutSuffix = deleteErrorStringFromMathMLSolution(mathMLWithoutUnexpectedCodes, listOf(errorPrefix, syntaxErrorPrefix))
    val mathMLWithoutBrushing = dropPerformedMathMLBrushing(mathMLWithoutSuffix)
    val mathMLWithoutSupportingTags = deleteUnsupportedMathMLTags(mathMLWithoutBrushing)
    val mathMLAfterSpecificSystemReplacements = specificMathMlSystemReplacements(mathMLWithoutSupportingTags)
    val mathML = correctMathMlTagsAccordingToBracketsFromEnd(mathMLAfterSpecificSystemReplacements)
    if (mathML.contains("error", ignoreCase = true) && mathML.contains("#FF")){
        return mathML
    }
    log.addMessage({ "input transformations in mathML without brushing: '''$mathML'''" }, level = 0)
    val transformationChainParser = TransformationChainParser(mathML,
            nameForRuleDesignationsPossible = false,
            functionConfiguration = compiledConfiguration.functionConfiguration,
            factsLogicConfiguration = compiledConfiguration.factsLogicConfiguration,
            compiledImmediateVariableReplacements = compiledConfiguration.compiledImmediateVariableReplacements)
    log.addMessage({ "input transformations parsing started" }, MessageType.USER, level = 0)
    val error = transformationChainParser.parse()
    if (error != null) {
        return returnParsingError(error, mathML)
    } else {
        log.addMessage({ "input transformations are parsed successfully" }, MessageType.USER, level = 0)
        log.addMessageWithFactDetail({ "parsed input transformations: " }, transformationChainParser.root, MessageType.USER)
        val factComporator = compiledConfiguration.factComporator
        val solutionRoot = combineSolutionRoot(targetFactIdentifier, transformationChainParser, compiledConfiguration)
        log.addMessage({ "input transformations checking started" }, MessageType.USER, level = 0)
        val checkingResult = solutionRoot.check(factComporator, false,
                listOf(),
                listOf(),
                log.factConstructorViewer.additionalFactsFromItsIdentifiers(additionalFactsIdentifiers))
        log.addMessage({
            "input transformations checking result: '" +
                    (if (checkingResult.isCorrect) "correct" else "incorrect - ${checkingResult.description}") +
                    "'"
        }, MessageType.USER, level = 0)
        val resultWithColoredTasks = brushMathMl(transformationChainParser.originalTransformationChain, checkingResult.coloringTasks)
        val result = setBackgroundColorMathMl(resultWithColoredTasks, compiledConfiguration.checkedFactAccentuation.checkedFactColor.checkedFactBackgroundColor)
        log.addMessage({ "transformations in mathML after brushing: '''$result'''" }, level = 0)

        if (!checkingResult.isCorrect) {
            if (!brushedMathML.startsWith("<")){
                return errorPrefix + ": " + checkingResult.description
            }
            return if (shortErrorDescription == "1") {
                addErrorStringToMathMLSolution(result, "Unclear transformation or incomplete solution. Try to fix errors or to write more details.", errorPrefix)
            } else addErrorStringToMathMLSolution(result, checkingResult.description, errorPrefix)
        }

        if (minNumberOfMultipliersInAnswer.isNotBlank()) {
            val minNumberOfMultipliers = minNumberOfMultipliersInAnswer.toInt()
            val targetVariables = targetVariablesNames.split(configSeparator)
                    .map { it.trim() }.toSet()
            val targetExpression = (log.factConstructorViewer.constructFactByIdentifier(targetFactIdentifier) as Expression).data
            val error = solutionRoot.isFactorizationForVariables(minNumberOfMultipliers, targetVariables, targetExpression, factComporator)
            if (error != null) {
                log.addMessage({ error.description }, MessageType.USER, level = 0)
                return addErrorStringToMathMLSolution(result, error.description, errorPrefix)
            }
        } else if (maxNumberOfDivisionsInAnswer.isNotBlank()) {
            val maxNumberOfDivisions = maxNumberOfDivisionsInAnswer.toInt()
            val targetExpression = (log.factConstructorViewer.constructFactByIdentifier(targetFactIdentifier) as Expression).data
            val error = solutionRoot.hasNoFractions(maxNumberOfDivisions, targetExpression, factComporator)
            if (error != null) {
                log.addMessage({ error.description }, MessageType.USER, level = 0)
                return addErrorStringToMathMLSolution(result, error.description, errorPrefix)
            }
        } else {
            if (targetVariablesNames.isNotBlank()) {
                val targetVariables = targetVariablesNames.split(configSeparator)
                        .map { Pair(it.trim(), false) }.toMap().toMutableMap()
                val allowedVariables = if (allowedVariablesNames != "") {
                    allowedVariablesNames.split(configSeparator)
                            .map { it.trim() }.toSet()
                } else setOf()
                val error = solutionRoot.isSolutionForVariables(targetVariables, allowedVariables = allowedVariables)
                for ((variable, expressed) in targetVariables) {
                    if (!expressed) {
                        log.addMessage({ "variable '$variable' is not expressed" }, MessageType.USER, level = 0)
                        return addErrorStringToMathMLSolution(result, "variable '$variable' is not expressed", errorPrefix)
                    }
                }
                if (error != null) {
                    log.addMessage({ error.description }, MessageType.USER, level = 0)
                    return addErrorStringToMathMLSolution(result, error.description, errorPrefix)
                }
            }
            if (forbiddenFunctions.isNotBlank()){
                val forbidden = pairsStringIntFromString(forbiddenFunctions)
                val targetExpression = (log.factConstructorViewer.constructFactByIdentifier(targetFactIdentifier) as Expression).data
                val error = solutionRoot.isSolutionWithoutFunctions(forbidden, targetExpression, factComporator)
                if (error != null) {
                    log.addMessage({ error.description }, MessageType.USER, level = 0)
                    return addErrorStringToMathMLSolution(result, error.description, errorPrefix)
                }
            }
            log.addMessage({ "Answer checked successfully" }, MessageType.USER, level = 0)
        }

        return result
    }
}

private fun returnParsingError(error: ParserError, mathML: String) = returnParsingError(error.description, error.position, error.endPosition, mathML)

private fun returnParsingError(description: String, start: Int, end: Int, mathML: String): String {
    log.addMessage({ "transformations parsing error: '${description}'" }, MessageType.USER, level = 0)
    val positions = selectPlacesForColoringByFragment(mathML, start, end)
    val result = mathML.substring(0, positions.first) + underliningStartMathML +
            mathML.substring(positions.first, positions.second) + underliningEndMathML +
            mathML.substring(positions.second, mathML.length)
    return addErrorStringToMathMLSolution(result, description, "Syntax&#xA0;error&#xA0;(underlined)")
}

fun replaceSpaceMathMLAliases(string: String): String {
    val result = spaceRegex.replace(string, "&#xA0;")
    return result
}

val spaceRegex = """&#x200\d;""".toRegex()

fun deleteUnsupportedMathMLTags(string: String): String {
    val result = StringBuilder()
    var pos = 0
    while (pos < string.length) {
        var toWhile = false
        for (tag in unsupportedTagListMathML) {
            if (remainingExpressionStartsWith("</$tag>", string, pos)) {
                pos += "</$tag>".length
                toWhile = true
                result.append("</mrow>")
            } else if (remainingExpressionStartsWith("<$tag", string, pos)) {
                val actualTag = readOpenTagStringIfItPresent(string, pos)
                pos += actualTag!!.length
                toWhile = true
                result.append("<mrow>")
            }
            if (toWhile) {
                break
            }
        }
        if (toWhile) {
            continue
        }
        result.append(string[pos])
        pos++
    }
    return result.toString()
}

fun correctMathMlTagsAccordingToBracketsFromEnd(mathML: String): String {
    var result = StringBuilder()
    val tag = "msup"
    var tagBracketsStack = mutableListOf<String>()
    var valuesToAddMap = mutableMapOf<String, String>()
    var currentPos = mathML.lastIndex
    while (currentPos >= 0){
        result.append(mathML[currentPos])
        if (mathML[currentPos] == ')'){
            tagBracketsStack.add(")")
        } else if (mathML[currentPos] == '<'){
            if (remainingExpressionStartsWith("</$tag", mathML, currentPos)) {
                tagBracketsStack.add(tag)
            } else if (remainingExpressionStartsWith("<$tag", mathML, currentPos)) {
                if (tagBracketsStack.isEmpty()){
                    return returnParsingError("Not closed tag: '<$tag>'", currentPos - 4, currentPos + 6, mathML)
                }
                if (tagBracketsStack.last() == tag){
                    tagBracketsStack = tagBracketsStack.dropLast(1).toMutableList()
                } else {
                    tagBracketsStack = tagBracketsStack.dropLast(1).toMutableList()
                    val tagToMove = if (remainingExpressionStartsWith("<$tag><mrow>", mathML, currentPos))
                        "<$tag><mrow>"
                    else ""
                    result = StringBuilder(result.dropLast(tagToMove.length))
                    valuesToAddMap.put(tag,tagToMove.reversed())
                }
            }
        } else if (mathML[currentPos] == '('){
            if (tagBracketsStack.isEmpty()){
                return returnParsingError("Not closed bracket: '('", currentPos - 4, currentPos + 6, mathML)
            }
            if (tagBracketsStack.last() == "("){
                tagBracketsStack = tagBracketsStack.dropLast(1).toMutableList()
            } else {
                val currentTag = tagBracketsStack.last()
                tagBracketsStack = tagBracketsStack.dropLast(1).toMutableList()
                if (valuesToAddMap.containsKey(currentTag)){
                    result.append("<mo>".reversed())
                    currentPos -= 4
                    result.append(valuesToAddMap.get(currentTag))
                }
            }
        }
        currentPos--
    }
    return result.reverse().toString()
}

fun specificMathMlSystemReplacements(mathML: String): String {
    return mathML.replace("</mtd></mtr></mtable><mo>=</mo><mo>&gt;</mo></mrow></mfenced>", "</mtd></mtr></mtable></mfenced><mo>=</mo><mo>&gt;</mo>")
            .replace("</mtd></mtr></mtable><mo>&#x21D2;</mo></mrow></mfenced>", "</mtd></mtr></mtable></mfenced><mo>&#x21D2;</mo>")
            .replace("<mrow><mtable columnalign=\"left\"><mtr><mtd>", "<mtable columnalign=\"left\"><mtr><mtd>")
}

fun addErrorStringToMathMLSolution(mathML: String, error: String, errorPrefix: String): String {
    val withoutEnd = mathML.substring(0, mathML.length - "</math>".length)
    val escapedError = error
            .replace("<", "&lt")
            .replace(">", "&gt")
    return withoutEnd + "<mspace linebreak=\"newline\"/>" +
            "<mtext mathvariant=\"bold\" mathcolor=\"#FF0000\">$errorPrefix: " + escapedError +
            "</mtext></math>"
}

fun deleteErrorStringFromMathMLSolution(mathML: String, errorPrefix: List<String>): String {
    if (mathML.endsWith("</mtext></math>")) {
        val errorMessage = mathML.substringAfterLast("<mspace linebreak=\"newline\"/><mtext mathvariant=\"bold\" mathcolor=\"#FF0000\">")
        for (prefix in errorPrefix) {
            if (errorMessage.startsWith(prefix)) {
                val withoutEnd = mathML.substringBeforeLast("<mspace linebreak=\"newline\"/><mtext mathvariant=\"bold\" mathcolor=\"#FF0000\">")
                return withoutEnd + "</math>"
            }
        }
    }
    return mathML
}

val unsupportedTagListMathML = listOf("mstyle", "menclose", "mpadded")
val underliningStartMathML = "<menclose mathcolor=\"#7F0000\" notation=\"bottom\">"
val underliningEndMathML = "</menclose>"