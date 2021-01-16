package baseoperations

import expressiontree.ExpressionNode


data class BaseOperationDefinitionWithDomain(
        val baseOp: String,
        val generalValuesDomain: DefinitionDomain,
        val generalDefinitionDomain: List<DefinitionDomain>,
        val funcToCall: (ExpressionNode, Int, DefinitionDomain) -> DefinitionDomain
)
