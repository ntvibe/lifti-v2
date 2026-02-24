import { useMemo, useState } from 'react';
import { useAppData } from '../lib/app-data';
import EmptyState from '../components/EmptyState';
import ExerciseTagList from '../components/ExerciseTagList';

export default function LibraryPage() {
  const { exercises } = useAppData();
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');

  const allMuscles = useMemo(() => {
    return [...new Set(exercises.flatMap((exercise) => exercise.muscleGroups))].sort();
  }, [exercises]);

  const allEquipment = useMemo(() => {
    return [...new Set(exercises.flatMap((exercise) => exercise.equipment))].sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const nameMatch = q ? exercise.name.toLowerCase().includes(q) : true;
      const muscleMatch =
        muscleFilter === 'all' ? true : exercise.muscleGroups.includes(muscleFilter);
      const equipmentMatch =
        equipmentFilter === 'all' ? true : exercise.equipment.includes(equipmentFilter);
      return nameMatch && muscleMatch && equipmentMatch;
    });
  }, [query, muscleFilter, equipmentFilter, exercises]);

  return (
    <section className="stack">
      <div className="card stack">
        <h2>Exercise Library</h2>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercises"
          aria-label="Search exercises"
        />
        <div className="grid two">
          <label>
            Muscle group
            <select value={muscleFilter} onChange={(event) => setMuscleFilter(event.target.value)}>
              <option value="all">All</option>
              {allMuscles.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </label>
          <label>
            Equipment
            <select
              value={equipmentFilter}
              onChange={(event) => setEquipmentFilter(event.target.value)}
            >
              <option value="all">All</option>
              {allEquipment.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState
          title="No matches"
          description="Try a different search term or reset your filters."
        />
      ) : (
        filtered.map((exercise) => (
          <article key={exercise.id} className="card fade-in">
            <h3>{exercise.name}</h3>
            <ExerciseTagList label="Muscles" tags={exercise.muscleGroups} />
            <ExerciseTagList label="Equipment" tags={exercise.equipment} />
          </article>
        ))
      )}
    </section>
  );
}
