import config.CompiledConfiguration
import config.FunctionConfiguration
import expressiontree.ExpressionNode
import expressiontree.ExpressionNodeConstructor
import expressiontree.ExpressionSubstitution
import expressiontree.SubstitutionSelectionData
import expressiontree.fillSubstitutionSelectionData
import expressiontree.applySubstitution
import expressiontree.generateSubstitutionsBySelectedNodes

@JsName("structureStringToExpression")
fun structureStringToExpression(
        structureString: String,
        scope: String = "",
        functionConfiguration: FunctionConfiguration = FunctionConfiguration(
                scopeFilter = scope.split(";").filter { it.isNotEmpty() }.toSet()
        )
): ExpressionNode {
    val expressionNodeConstructor = ExpressionNodeConstructor(functionConfiguration)
    val result = expressionNodeConstructor.construct(structureString)
    result.computeNodeIdsAsNumbersInDirectTraversalAndDistancesToRoot()
    result.computeIdentifier()
    return result
}

@JsName("createCompiledConfigurationFromExpressionSubstitutionsAndParams")
fun createCompiledConfigurationFromExpressionSubstitutionsAndParams (
        expressionSubstitutions: Array<ExpressionSubstitution>,
        additionalParamsMap: Map<String, String> = mapOf()
) = CompiledConfiguration(additionalParamsMap = additionalParamsMap).apply {
    compiledExpressionTreeTransformationRules.clear()
    compiledExpressionSimpleAdditionalTreeTransformationRules.clear()
    for (substitution in expressionSubstitutions){
        compiledExpressionTreeTransformationRules.add(substitution)
        if (substitution.simpleAdditional) {
            compiledExpressionSimpleAdditionalTreeTransformationRules.add(substitution)
        }
    }
}

@JsName("expressionSubstitutionFromStructureStrings")
fun expressionSubstitutionFromStructureStrings(
        leftStructureString: String,
        rightStructureString: String,
        basedOnTaskContext: Boolean = false,
        matchJumbledAndNested: Boolean = false,
        simpleAdditional: Boolean = false,
        isExtending: Boolean = false,
        priority: Int = 50,
        nameEn: String = "",
        nameRu: String = ""
) = ExpressionSubstitution(
        api.structureStringToExpression(leftStructureString),
        api.structureStringToExpression(rightStructureString),
        basedOnTaskContext = basedOnTaskContext,
        matchJumbledAndNested = matchJumbledAndNested,
        simpleAdditional = simpleAdditional,
        isExtending = isExtending,
        priority = priority,
        nameEn = nameEn,
        nameRu = nameRu
)

@JsName("applySubstitutionInSelectedPlace")
fun applySubstitutionInSelectedPlace (
        expression: ExpressionNode,
        selectedNodeIds: Array<Int>,
        substitution: ExpressionSubstitution,
        compiledConfiguration: CompiledConfiguration,
        simplifyNotSelectedTopArguments: Boolean = false
): ExpressionNode? {
    val substitutionSelectionData = SubstitutionSelectionData(expression, selectedNodeIds, compiledConfiguration)
    fillSubstitutionSelectionData(substitutionSelectionData)
    return applySubstitution(substitutionSelectionData, substitution, simplifyNotSelectedTopArguments)
}

@JsName("findApplicableSubstitutionsInSelectedPlace")
fun findApplicableSubstitutionsInSelectedPlace (
        expression: ExpressionNode,
        selectedNodeIds: Array<Int>,
        compiledConfiguration: CompiledConfiguration,
        simplifyNotSelectedTopArguments: Boolean = false,
        withReadyApplicationResult: Boolean = true
) = generateSubstitutionsBySelectedNodes(
        SubstitutionSelectionData(expression, selectedNodeIds, compiledConfiguration),
        withReadyApplicationResult
)
