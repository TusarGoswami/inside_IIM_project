import { useState, useCallback, useRef, useEffect } from 'react';
import { startResearch, getStreamUrl } from '../api/researchClient.js';
import { STAGES } from '../types/research.js';

/**
 * Custom React hook managing the live research session lifecycle.
 * Opens SSE connection, tracks stage transitions, and accumulates partial/final state.
 *
 * @returns {{
 *   stage: string,
 *   runId: string | null,
 *   partialState: object,
 *   finalState: object | null,
 *   error: string | null,
 *   startSession: (companyName: string) => Promise<void>,
 *   resetSession: () => void
 * }}
 */
export function useResearchSession() {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [runId, setRunId] = useState(null);
  const [partialState, setPartialState] = useState({});
  const [finalState, setFinalState] = useState(null);
  const [error, setError] = useState(null);

  const eventSourceRef = useRef(null);

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const resetSession = useCallback(() => {
    closeStream();
    setStage(STAGES.IDLE);
    setRunId(null);
    setPartialState({});
    setFinalState(null);
    setError(null);
  }, [closeStream]);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  const startSession = useCallback(async (companyName) => {
    resetSession();
    setStage(STAGES.RESEARCHING);
    setPartialState({ companyName, reasoningTrail: [] });

    try {
      // 1. Post request to start run
      const { runId: newRunId } = await startResearch(companyName);
      setRunId(newRunId);

      // 2. Open SSE stream connection
      const streamUrl = getStreamUrl(newRunId);
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { node, data } = parsed;

          if (node === 'done') {
            setFinalState(data);
            setPartialState(prev => ({ ...prev, ...data }));
            setStage(STAGES.COMPLETED);
            closeStream();
            return;
          }

          if (node === 'error' || (data && data.error)) {
            const errMsg = (data && data.error) || 'An unexpected error occurred during research.';
            setError(errMsg);
            setStage(STAGES.ERROR);
            closeStream();
            return;
          }

          // Accumulate partial state from node event
          setPartialState(prev => {
            const nextState = { ...prev, ...data };
            if (data.reasoningTrail) {
              nextState.reasoningTrail = [...(prev.reasoningTrail || []), ...data.reasoningTrail];
            }
            return nextState;
          });

          // Transition UI stepper stages based on completing node
          switch (node) {
            case 'researcherNode':
              setStage(STAGES.WRITING_MEMO);
              break;
            case 'memoWriterNode':
              setStage(STAGES.DEBATING);
              break;
            case 'bullNode':
            case 'bearNode':
            case 'debateJudgeCheck':
            case 'rebuttalNode':
              setStage(STAGES.AUDITING_RISK);
              break;
            case 'riskAuditorNode':
              setStage(STAGES.VOTING);
              break;
            case 'scoreAggregatorNode':
            case 'verdictJudgeNode':
              setStage(STAGES.COMPLETED);
              break;
            default:
              break;
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      es.onerror = (err) => {
        console.error('SSE connection error:', err);
        // EventSource automatically retries unless explicitly closed
        if (es.readyState === EventSource.CLOSED) {
          setError('Lost connection to backend server.');
          setStage(STAGES.ERROR);
        }
      };
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Could not connect to backend server.');
      setStage(STAGES.ERROR);
    }
  }, [resetSession, closeStream]);

  return {
    stage,
    runId,
    partialState,
    finalState,
    error,
    startSession,
    resetSession,
  };
}
