import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/app-data';
import EmptyState from '../components/EmptyState';

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function fmtDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSec % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function WorkoutPlayerPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { plans, exercises, appendSession, settings } = useAppData();

  const plan = plans.find((item) => item.id === planId);
  const exerciseById = useMemo(
    () => Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restRemaining, setRestRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAtMs, setCompletedAtMs] = useState(null);
  const [exerciseStates, setExerciseStates] = useState(() =>
    (plan?.exercises ?? []).map((item) => ({
      exerciseId: item.exerciseId,
      targetSets: item.sets,
      completedSets: 0,
      targetReps: item.reps,
      targetWeight: item.weight
    }))
  );

  const pausedAtRef = useRef(null);

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!isRunning || restRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setRestRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, restRemaining]);

  if (!plan) {
    return <EmptyState title="Plan not found" description="Go back and choose a valid workout plan." />;
  }

  if (!plan.exercises.length) {
    return (
      <EmptyState
        title="Plan is empty"
        description="Add exercises in planner before starting workout mode."
      />
    );
  }

  const currentPlanExercise = plan.exercises[currentExerciseIndex];
  const currentExercise = exerciseById[currentPlanExercise.exerciseId];

  const elapsedSource = isCompleted && completedAtMs ? completedAtMs : now;
  const elapsed =
    elapsedSource -
    startedAt -
    totalPausedMs -
    (pausedAtRef.current && !isCompleted ? elapsedSource - pausedAtRef.current : 0);

  const totalSets = plan.exercises.reduce((sum, item) => sum + item.sets, 0);
  const completedSets = exerciseStates.reduce((sum, item) => sum + item.completedSets, 0);

  function togglePause() {
    if (isCompleted) return;
    if (isRunning) {
      pausedAtRef.current = Date.now();
      setIsRunning(false);
      return;
    }
    if (pausedAtRef.current) {
      setTotalPausedMs((value) => value + (Date.now() - pausedAtRef.current));
    }
    pausedAtRef.current = null;
    setIsRunning(true);
  }

  function finishWorkout(finalExerciseStates = exerciseStates) {
    if (isCompleted) return;
    const endedAt = Date.now();
    const pausedExtra = pausedAtRef.current ? endedAt - pausedAtRef.current : 0;
    const finalPausedMs = totalPausedMs + pausedExtra;
    const session = {
      id: uid('session'),
      planId: plan.id,
      planName: plan.name,
      startedAt: new Date(startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      exerciseStates: finalExerciseStates,
      totalPausedMs: finalPausedMs
    };
    appendSession(session);
    setTotalPausedMs(finalPausedMs);
    setCompletedAtMs(endedAt);
    pausedAtRef.current = null;
    setIsRunning(false);
    setIsCompleted(true);
  }

  function completeSet() {
    if (isCompleted || !isRunning || restRemaining > 0) return;

    const setCountAfter = currentSet;
    const nextExerciseStates = exerciseStates.map((state, idx) =>
      idx === currentExerciseIndex
        ? { ...state, completedSets: Math.min(state.targetSets, state.completedSets + 1) }
        : state
    );
    setExerciseStates(nextExerciseStates);

    const isLastSetInExercise = setCountAfter >= currentPlanExercise.sets;
    if (!isLastSetInExercise) {
      setCurrentSet((value) => value + 1);
      if (settings.autoStartRest && currentPlanExercise.restSec > 0) {
        setRestRemaining(currentPlanExercise.restSec);
      }
      return;
    }

    const isLastExercise = currentExerciseIndex >= plan.exercises.length - 1;
    if (isLastExercise) {
      finishWorkout(nextExerciseStates);
      return;
    }

    setCurrentExerciseIndex((value) => value + 1);
    setCurrentSet(1);
    if (settings.autoStartRest && currentPlanExercise.restSec > 0) {
      setRestRemaining(currentPlanExercise.restSec);
    }
  }

  return (
    <section className="stack">
      <article className="card stack">
        <p className="muted-text">Workout Player</p>
        <h2>{plan.name}</h2>
        <p>
          Time: <strong>{fmtDuration(elapsed)}</strong>
        </p>
        <p>
          Progress: <strong>{completedSets}</strong> / {totalSets} sets
        </p>
        {restRemaining > 0 && <p className="accent-text">Rest: {restRemaining}s</p>}
      </article>

      <article className="card stack fade-in">
        <h3>{currentExercise?.name ?? currentPlanExercise.exerciseId}</h3>
        <p className="muted-text">
          Exercise {currentExerciseIndex + 1}/{plan.exercises.length}
        </p>
        <div className="grid two">
          <p>
            Set: {currentSet} / {currentPlanExercise.sets}
          </p>
          <p>Reps: {currentPlanExercise.reps}</p>
          <p>
            Weight: {currentPlanExercise.weight} {settings.unit}
          </p>
          <p>Rest: {currentPlanExercise.restSec}s</p>
        </div>
        <div className="row">
          <button onClick={completeSet} disabled={!isRunning || restRemaining > 0 || isCompleted}>
            Complete Set
          </button>
          <button className="ghost" onClick={togglePause}>
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button className="danger" onClick={() => finishWorkout()}>
            Finish
          </button>
        </div>
      </article>

      {isCompleted && (
        <article className="card stack">
          <h3>Workout Complete</h3>
          <p>Session saved to history.</p>
          <div className="row">
            <button onClick={() => navigate('/history')}>View History</button>
            <Link to="/plans" className="button-link ghost">
              Back to Plans
            </Link>
          </div>
        </article>
      )}
    </section>
  );
}
