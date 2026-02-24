import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppData } from '../lib/app-data';
import EmptyState from '../components/EmptyState';

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

export default function PlansPage() {
  const { plans, createPlan, updatePlan, deletePlan } = useAppData();
  const [newPlanName, setNewPlanName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [plans]
  );

  function submitNewPlan(event) {
    event.preventDefault();
    const name = newPlanName.trim();
    if (!name) return;
    createPlan(name);
    setNewPlanName('');
  }

  return (
    <section className="stack">
      <form className="card row" onSubmit={submitNewPlan}>
        <input
          value={newPlanName}
          onChange={(event) => setNewPlanName(event.target.value)}
          placeholder="Create a new plan"
          aria-label="Plan name"
          maxLength={80}
        />
        <button type="submit">Add</button>
      </form>

      {!sortedPlans.length ? (
        <EmptyState
          title="No plans yet"
          description="Create your first workout plan and start building exercises."
        />
      ) : (
        sortedPlans.map((plan) => (
          <article key={plan.id} className="card plan-card fade-in">
            {editingId === plan.id ? (
              <form
                className="row"
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = editingName.trim();
                  if (!name) return;
                  updatePlan(plan.id, { name });
                  setEditingId(null);
                  setEditingName('');
                }}
              >
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  autoFocus
                  maxLength={80}
                />
                <button type="submit">Save</button>
                <button type="button" className="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h3>{plan.name}</h3>
                <p className="muted-text">{plan.exercises.length} exercises</p>
                <p className="muted-text">Updated {formatDate(plan.updatedAt)}</p>
                <div className="row">
                  <Link to={`/plans/${plan.id}`} className="button-link">
                    Edit
                  </Link>
                  <Link to={`/play/${plan.id}`} className="button-link accent">
                    Start
                  </Link>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setEditingId(plan.id);
                      setEditingName(plan.name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deletePlan(plan.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))
      )}
    </section>
  );
}
