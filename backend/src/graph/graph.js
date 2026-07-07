import { StateGraph, END, START } from '@langchain/langgraph';
import { ICStateAnnotation } from './state.js';

// Node imports
import { researcherNode } from './nodes/researcher.node.js';
import { memoWriterNode } from './nodes/memoWriter.node.js';
import { bullNode } from './nodes/bull.node.js';
import { bearNode } from './nodes/bear.node.js';
import { debateJudgeCheck, shouldRebuttal } from './nodes/debateJudgeCheck.node.js';
import { rebuttalNode } from './nodes/rebuttal.node.js';
import { riskAuditorNode } from './nodes/riskAuditor.node.js';
import { scoreAggregatorNode } from './nodes/scoreAggregator.node.js';
import { verdictJudgeNode } from './nodes/verdictJudge.node.js';

/**
 * Builds and compiles the Investment Committee LangGraph workflow.
 *
 * Graph topology:
 *   START
 *     → researcherNode
 *     → memoWriterNode
 *     → (parallel: bullNode, bearNode)
 *     → debateJudgeCheck
 *         → [conditional] rebuttalNode → riskAuditorNode
 *         → [conditional] riskAuditorNode (skip rebuttal)
 *     → scoreAggregatorNode
 *     → verdictJudgeNode
 *   → END
 *
 * @returns {import('@langchain/langgraph').CompiledStateGraph} The compiled graph
 */
export function buildGraph() {
  const graph = new StateGraph(ICStateAnnotation);

  // ── Register all nodes ──
  graph.addNode('researcherNode', wrapNode('researcherNode', researcherNode));
  graph.addNode('memoWriterNode', wrapNode('memoWriterNode', memoWriterNode));
  graph.addNode('bullNode', wrapNode('bullNode', bullNode));
  graph.addNode('bearNode', wrapNode('bearNode', bearNode));
  graph.addNode('debateJudgeCheck', wrapNode('debateJudgeCheck', debateJudgeCheck));
  graph.addNode('rebuttalNode', wrapNode('rebuttalNode', rebuttalNode));
  graph.addNode('riskAuditorNode', wrapNode('riskAuditorNode', riskAuditorNode));
  graph.addNode('scoreAggregatorNode', wrapNode('scoreAggregatorNode', scoreAggregatorNode));
  graph.addNode('verdictJudgeNode', wrapNode('verdictJudgeNode', verdictJudgeNode));

  // ── Sequential edges ──
  // START → researcherNode → memoWriterNode
  graph.addEdge(START, 'researcherNode');
  graph.addEdge('researcherNode', 'memoWriterNode');

  // memoWriterNode → parallel fan-out to bullNode and bearNode
  // LangGraph supports parallel by adding multiple edges from one node
  graph.addEdge('memoWriterNode', 'bullNode');
  graph.addEdge('memoWriterNode', 'bearNode');

  // Both bull and bear fan-in to debateJudgeCheck
  graph.addEdge('bullNode', 'debateJudgeCheck');
  graph.addEdge('bearNode', 'debateJudgeCheck');

  // ── Conditional edge from debateJudgeCheck ──
  // If scores are close (within 15), go to rebuttal; otherwise skip to risk auditor
  graph.addConditionalEdges('debateJudgeCheck', shouldRebuttal, {
    rebuttalNode: 'rebuttalNode',
    riskAuditorNode: 'riskAuditorNode',
  });

  // rebuttalNode always leads to riskAuditorNode
  graph.addEdge('rebuttalNode', 'riskAuditorNode');

  // ── Final sequential pipeline ──
  graph.addEdge('riskAuditorNode', 'scoreAggregatorNode');
  graph.addEdge('scoreAggregatorNode', 'verdictJudgeNode');
  graph.addEdge('verdictJudgeNode', END);

  return graph.compile();
}

/**
 * Wraps a node function with error handling.
 * On unrecoverable failure, sets state.error and returns gracefully
 * instead of crashing the entire graph execution.
 *
 * @param {string} nodeName - Name of the node for logging
 * @param {Function} nodeFn - The actual node function
 * @returns {Function} Wrapped node function
 */
function wrapNode(nodeName, nodeFn) {
  return async (state) => {
    // If a previous node has already errored, skip execution
    if (state.error) {
      return { reasoningTrail: [`[${nodeName}] Skipped — previous error: ${state.error}`] };
    }

    const startTime = Date.now();
    console.log(`\n==================================================`);
    console.log(`[NODE TIMING - START] ${nodeName} at ${new Date(startTime).toISOString()}`);
    console.log(`==================================================\n`);

    try {
      const result = await nodeFn(state);
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`\n==================================================`);
      console.log(`[NODE TIMING - END] ${nodeName} at ${new Date(endTime).toISOString()} (Duration: ${duration}ms)`);
      console.log(`==================================================\n`);
      return result;
    } catch (err) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`[${nodeName}] Error:`, err);
      console.log(`\n==================================================`);
      console.log(`[NODE TIMING - END WITH ERROR] ${nodeName} at ${new Date(endTime).toISOString()} (Duration: ${duration}ms)`);
      console.log(`==================================================\n`);
      return {
        error: `${nodeName} failed: ${err.message}`,
        reasoningTrail: [`[${nodeName}] ERROR: ${err.message}`],
      };
    }
  };
}
