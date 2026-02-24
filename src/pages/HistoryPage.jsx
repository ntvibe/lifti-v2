import { useMemo } from 'react';
import { useAppData } from '../lib/app-data';
import EmptyState from '../components/EmptyState';

function fmtDate(iso) {
  return new Date(iso).toLocaleString();
}

function sessionDuration(session) {
  const started = new Date(session.startedAt).getTime();
  const ended = new Date(session.endedAt).getTime();
  const ms = Math.max(0, ended - started - (session.totalPausedMs ?? 0));
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${mins}m ${sec}s`;
}

export default function HistoryPage() {
  const { sessions } = useAppData();

  const totalStats = useMemo(() => {
    const workoutCount = sessions.length;
    const totalExercises = sessions.reduce(
      (sum, session) => sum + (session.exerciseStates?.length ?? 0),
      0
    );
    return { workoutCount, totalExercises };
  }, [sessions]);

  return (
    <section className="stack">
      <article className="card grid two">
        <div>
          <p className="muted-text">Workouts</p>
          <h2>{totalStats.workoutCount}</h2>
        </div>
        <div>
          <p className="muted-text">Exercises Completed</p>
          <h2>{totalStats.totalExercises}</h2>
        </div>
      </article>

      {!sessions.length ? (
        <EmptyState
          title="No history yet"
          description="Finish a workout to see your session timeline and stats here."
        />
      ) : (
        sessions.map((session) => {
          const completedExercises = (session.exerciseStates ?? []).filter(
            (exercise) => exercise.completedSets >= exercise.targetSets
          ).length;

          return (
            <article key={session.id} className="card fade-in">
              <h3>{session.planName}</h3>
              <p className="muted-text">{fmtDate(session.startedAt)}</p>
              <p>Duration: {sessionDuration(session)}</p>
              <p>
                Exercises completed: {completedExercises}/{session.exerciseStates?.length ?? 0}
              </p>
            </article>
          );
        })
      )}
    </section>
  );
}
