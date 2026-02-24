import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppData } from '../lib/app-data';
import EmptyState from '../components/EmptyState';

function NumberInput({ value, onChange, min = 0 }) {
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

export default function PlannerPage() {
  const { planId } = useParams();
  const {
    plans,
    exercises,
    addExerciseToPlan,
    updatePlanExercise,
    removePlanExercise
  } = useAppData();
  const [query, setQuery] = useState('');

  const plan = plans.find((item) => item.id === planId);

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises.slice(0, 40);
    return exercises
      .filter((exercise) => exercise.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [query, exercises]);

  const exerciseById = useMemo(
    () => Object.fromEntries(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  if (!plan) {
    return <EmptyState title="Plan not found" description="Choose a plan from the Plans screen." />;
  }

  return (
    <section className="stack">
      <div className="card">
        <h2>{plan.name}</h2>
        <p className="muted-text">Build your workout structure and then start the session.</p>
        <Link to={`/play/${plan.id}`} className="button-link accent">
          Start Workout
        </Link>
      </div>

      <div className="card stack">
        <h3>Add Exercises</h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercise"
          aria-label="Search exercise"
        />
        <div className="chip-list">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="chip"
              onClick={() => addExerciseToPlan(plan.id, exercise.id)}
            >
              + {exercise.name}
            </button>
          ))}
        </div>
      </div>

      {!plan.exercises.length ? (
        <EmptyState
          title="No exercises in this plan"
          description="Add exercises above and configure sets, reps, weight, and rest."
        />
      ) : (
        plan.exercises.map((item, index) => {
          const exercise = exerciseById[item.exerciseId];
          return (
            <article key={item.id} className="card stack fade-in">
              <div className="row spread">
                <h3>
                  {index + 1}. {exercise?.name ?? item.exerciseId}
                </h3>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removePlanExercise(plan.id, item.id)}
                >
                  Remove
                </button>
              </div>
              <div className="grid two">
                <label>
                  Sets
                  <NumberInput
                    value={item.sets}
                    min={1}
                    onChange={(value) => updatePlanExercise(plan.id, item.id, { sets: value })}
                  />
                </label>
                <label>
                  Reps
                  <NumberInput
                    value={item.reps}
                    min={1}
                    onChange={(value) => updatePlanExercise(plan.id, item.id, { reps: value })}
                  />
                </label>
                <label>
                  Weight
                  <NumberInput
                    value={item.weight}
                    min={0}
                    onChange={(value) => updatePlanExercise(plan.id, item.id, { weight: value })}
                  />
                </label>
                <label>
                  Rest (sec)
                  <NumberInput
                    value={item.restSec}
                    min={0}
                    onChange={(value) => updatePlanExercise(plan.id, item.id, { restSec: value })}
                  />
                </label>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
