package expressiontree

// Pointer on ExpressionNode is specified to mention that this code should be applied to nodeIds in one tree only
fun ExpressionNode.nodeIdsPositionsMap (nodeIds: List<Int>): Map<Int,Int> {
    val nodeIdsMap = mutableMapOf<Int, Int>()
    for (i in 0..nodeIds.lastIndex) {
        nodeIdsMap.put(nodeIds[i], i)
    }
    return nodeIdsMap
}

fun ExpressionNode.nodeIdsToNodeLinksInSameOrder (nodeIds: List<Int>): List<ExpressionNode> {
    val result = MutableList(nodeIds.size, {ExpressionNode(NodeType.EMPTY, "")})
    val nodeIdsMap = nodeIdsPositionsMap(nodeIds)
    nodeIdsToNodeLinksInSameOrderRecursive(nodeIdsMap, result)
    return result
}

private fun ExpressionNode.nodeIdsToNodeLinksInSameOrderRecursive (nodeIdsMap: Map<Int, Int>, result: MutableList<ExpressionNode>) {
    val index = nodeIdsMap[nodeId]
    if (index != null) {
        result[index] = this
    }
    for (child in children) {
        child.nodeIdsToNodeLinksInSameOrderRecursive(nodeIdsMap, result)
    }
}

fun ExpressionNode.findLowestSubtreeTopOfNodes (nodes: List<ExpressionNode>): ExpressionNode? {
    var currentSubtree = nodes.firstOrNull() ?: return null
    val nodeChains = nodes.toMutableList()
    var subtreeOfNodesFound = false
    while (!subtreeOfNodesFound) {
        subtreeOfNodesFound = true
        for (i in 0..nodeChains.lastIndex) {
            while (nodeChains[i].distanceToRoot > currentSubtree.distanceToRoot) {
                nodeChains[i] = nodeChains[i].parent ?: return null // tree is not consistent
            }
            if (nodeChains[i].distanceToRoot == currentSubtree.distanceToRoot && nodeChains[i].nodeId != currentSubtree.nodeId) {
                nodeChains[i] = nodeChains[i].parent ?: return null // tree is not consistent
            }
            if (nodeChains[i].distanceToRoot < currentSubtree.distanceToRoot) {
                currentSubtree = nodeChains[i]
                subtreeOfNodesFound = false
            }
        }
    }
    return currentSubtree
}

fun ExpressionNode.findLowestSubtreeWithNodes (nodes: List<ExpressionNode>): ExpressionNode? {
    var currentSubtree: ExpressionNode? = null
    val nodeChains = nodes.toMutableList()
    val nodeSelectedChains:MutableList<ExpressionNode?> = nodeChains.map { it.clone() }.toMutableList()
    val treeParts = nodeSelectedChains.map { Pair(it!!.nodeId, it) }.toMap().toMutableMap()
    var subtreeOfNodesFound = false
    while (!subtreeOfNodesFound) {
        subtreeOfNodesFound = true
        for (i in 0..nodeChains.lastIndex) {
            if (nodeSelectedChains[i] == null || (currentSubtree != null && nodeChains[i].nodeId == currentSubtree.nodeId))
                continue
            if (currentSubtree != null && ((nodeChains[i].distanceToRoot > currentSubtree.distanceToRoot) ||
                            (nodeChains[i].distanceToRoot == currentSubtree.distanceToRoot && nodeChains[i].nodeId != currentSubtree.nodeId))) {
                treeParts.remove(nodeChains[i].nodeId)
                nodeChains[i] = nodeChains[i].parent ?: return null // tree is not consistent
                val suchPart = treeParts[nodeChains[i].nodeId]
                if (suchPart != null) {
                    if (suchPart.children.all { it.nodeId != nodeSelectedChains[i]!!.nodeId})
                        suchPart.addChild(nodeSelectedChains[i]!!)
                    nodeSelectedChains[i] = null
                } else {
                    val newChainParent = nodeChains[i].copy()
                    newChainParent.addChild(nodeSelectedChains[i]!!)
                    nodeSelectedChains[i] = newChainParent
                    treeParts.put(nodeChains[i].nodeId, nodeSelectedChains[i]!!)
                }
                subtreeOfNodesFound = false
            } else if (currentSubtree == null || nodeChains[i].distanceToRoot < currentSubtree.distanceToRoot) {
                currentSubtree = nodeSelectedChains[i]!!
                subtreeOfNodesFound = false
            } else {
                for (j in 0..nodeSelectedChains[i]!!.children.lastIndex) {
                    currentSubtree.addChild(nodeSelectedChains[i]!!.children[j])
                }
                nodeSelectedChains[i] = null
            }
        }
    }
    if (currentSubtree != null) {
        currentSubtree.sortChildrenAscendingNodeIds()
    }
    return currentSubtree
}