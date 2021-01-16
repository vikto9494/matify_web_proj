import config.CompiledConfiguration
import config.FunctionConfiguration
import expressiontree.ExpressionNode
import expressiontree.ExpressionNodeConstructor
import expressiontree.ExpressionSubstitution
import expressiontree.SubstitutionSelectionData
import expressiontree.fillSubstitutionSelectionData
import expressiontree.applySubstitution
import expressiontree.generateSubstitutionsBySelectedNodes
import expressiontree.NodeType


//compiled configuration
@JsName("createCompiledConfigurationFromExpressionSubstitutionsAndParams")
fun createCompiledConfigurationFromExpressionSubstitutionsAndParams_JS(
        expressionSubstitutions: Array<ExpressionSubstitution>,
        additionalParamsMap: Map<String, String> = mapOf()
) = createCompiledConfigurationFromExpressionSubstitutionsAndParams(expressionSubstitutions, additionalParamsMap)

@JsName("createConfigurationFromRulePacksAndParams")
fun createConfigurationFromRulePacksAndParams_JS(
        rulePacks: Array<String> = listOf("Algebra").toTypedArray(),
        additionalParamsMap: Map<String, String> = mapOf()
) = createConfigurationFromRulePacksAndParams(rulePacks, additionalParamsMap)

@JsName("getSubstitutionsByRulePacks")
fun getSubstitutionsByRulePacks_JS(rulePacks: Array<String>) = getSubstitutionsByRulePacks(rulePacks).toTypedArray()


//expressions
@JsName("stringToExpression")
fun stringToExpression_JS(
        string: String,
        scope: String = "",
        isMathMl: Boolean = false,
        functionConfiguration: FunctionConfiguration = FunctionConfiguration(
                scopeFilter = scope.split(";").filter { it.isNotEmpty() }.toSet()
        ),
        compiledConfiguration: CompiledConfiguration = CompiledConfiguration(functionConfiguration = functionConfiguration)
) = stringToExpression(structureString, scope, isMathMl, functionConfiguration, compiledConfiguration)

@JsName("structureStringToExpression")
fun structureStringToExpression_JS(
        structureString: String,
        scope: String = "",
        functionConfiguration: FunctionConfiguration = FunctionConfiguration(
                scopeFilter = scope.split(";").filter { it.isNotEmpty() }.toSet()
        )
) = structureStringToExpression(structureString, scope, functionConfiguration)


@JsName("expressionToString")
fun expressionToString_JS(
        expressionNode: ExpressionNode,
        characterEscapingDepth: Int = 1
) = expressionToString(expressionNode, characterEscapingDepth)

@JsName("expressionToTexString")
fun expressionToTexString_JS(
        expressionNode: ExpressionNode,
        characterEscapingDepth: Int = 1
) = expressionToTexString(expressionNode, characterEscapingDepth)

@JsName("expressionToStructureString")
fun expressionToStructureString_JS(
        expressionNode: ExpressionNode
) = expressionToStructureString(expressionNode)


//substitutions
@JsName("expressionSubstitutionFromStructureStrings")
fun expressionSubstitutionFromStructureStrings_JSs(
        leftStructureString: String = "",
        rightStructureString: String = "",
        basedOnTaskContext: Boolean = false,
        matchJumbledAndNested: Boolean = false,
        simpleAdditional: Boolean = false,
        isExtending: Boolean = false,
        priority: Int = 50,
        code: String = "",
        nameEn: String = "",
        nameRu: String = ""
) = expressionSubstitutionFromStructureStrings(
        leftStructureString,
        rightStructureString,
        basedOnTaskContext,
        matchJumbledAndNested,
        simpleAdditional,
        isExtending,
        priority,
        code,
        nameEn,
        nameRu
)

@JsName("findApplicableSubstitutionsInSelectedPlace")
fun findApplicableSubstitutionsInSelectedPlace(
        expression: ExpressionNode,
        selectedNodeIds: Array<Int>,
        compiledConfiguration: CompiledConfiguration,
        simplifyNotSelectedTopArguments: Boolean = false,
        withReadyApplicationResult: Boolean = true
) = findApplicableSubstitutionsInSelectedPlace(expression, selectedNodeIds, compiledConfiguration, simplifyNotSelectedTopArguments, withReadyApplicationResult)


//check solution
@JsName("checkSolutionInTex")
fun checkSolutionInTex_JS(
        originalTexSolution: String, //string with learner solution in Tex format

        //// individual task parameters:
        startExpressionIdentifier: String = "", //Expression, from which learner need to start the transformations
        targetFactPattern: String = "", //Pattern that specify criteria that learner's answer must meet
        additionalFactsIdentifiers: String = "", ///Identifiers split by configSeparator - task condition facts should be here, that can be used as rules only for this task

        endExpressionIdentifier: String = "", //Expression, which learner need to deduce
        targetFactIdentifier: String = "", //Fact that learner need to deduce. It is more flexible than startExpressionIdentifier and endExpressionIdentifier, allow to specify inequality like '''EXPRESSION_COMPARISON{(+(/(sin(x);+(1;cos(x)));/(+(1;cos(x));sin(x))))}{<=}{(/(2;sin(x)))}'''

        //// general configuration parameters
        //functions, which null-weight transformations allowed (if no other transformations), split by configSeparator
        //choose one of 2 api forms:
        wellKnownFunctions: List<FunctionIdentifier> = listOf(),
        wellKnownFunctionsString: String = "+$configSeparator-1$configSeparator-$configSeparator-1$configSeparator*$configSeparator-1$configSeparator/$configSeparator-1",

        //functions, which null-weight transformations allowed with any other transformations, split by configSeparator
        //choose one of 2 api forms:
        unlimitedWellKnownFunctions: List<FunctionIdentifier> = wellKnownFunctions,
        unlimitedWellKnownFunctionsString: String = wellKnownFunctionsString,

        //expression transformation rules
        //choose one of api forms:
        expressionTransformationRules: List<ExpressionSubstitution> = listOf(), //full list of expression transformations rules
        expressionTransformationRulesString: String = "S(i, a, a, f(i))${configSeparator}f(a)${configSeparator}S(i, a, b, f(i))${configSeparator}S(i, a, b-1, f(i)) + f(b)", //function transformation rules, parts split by configSeparator; if it equals " " then expressions will be checked only by testing
        taskContextExpressionTransformationRules: String = "", //for expression transformation rules based on variables
        rulePacks: Array<String> = listOf<String>().toTypedArray(),

        maxExpressionTransformationWeight: String = "1.0",
        maxDistBetweenDiffSteps: String = "", //is it allowed to differentiate expression in one step
        scopeFilter: String = "", //subject scopes which user representation sings is used

        shortErrorDescription: String = "0" //make error message shorter and easier to understand: crop parsed steps from error description
) = checkSolutionInTex(
        originalTexSolution,

        startExpressionIdentifier,
        targetFactPattern,
        additionalFactsIdentifiers,

        endExpressionIdentifier,
        targetFactIdentifier,

        wellKnownFunctions,
        wellKnownFunctionsString,

        unlimitedWellKnownFunctions,
        unlimitedWellKnownFunctionsString,

        expressionTransformationRules,
        expressionTransformationRulesString,
        taskContextExpressionTransformationRules,
        rulePacks,

        maxExpressionTransformationWeight,
        maxDistBetweenDiffSteps,
        scopeFilter: String,

        shortErrorDescription
)


