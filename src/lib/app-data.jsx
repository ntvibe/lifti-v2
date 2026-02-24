import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lifti_v2_data';

const defaultSettings = {
  unit: 'kg',
  autoStartRest: true,
  accent: '#14f1d9'
};

const AppDataContext = createContext(null);

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { plans: [], sessions: [], settings: defaultSettings };
    }
    const parsed = JSON.parse(raw);
    return {
      plans: parsed.plans ?? [],
      sessions: parsed.sessions ?? [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) }
    };
  } catch {
    return { plans: [], sessions: [], settings: defaultSettings };
  }
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => readStorage());
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    async function loadExercises() {
      try {
        const res = await fetch('/data/exercises.seed.json');
        const seed = await res.json();
        const normalized = (seed.exercises ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          muscleGroups: [...(item.primaryMuscles ?? []), ...(item.secondaryMuscles ?? [])],
          equipment: item.equipment ?? []
        }));
        setExercises(normalized);
      } catch {
        setExercises([]);
      }
    }

    loadExercises();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', data.settings.accent || '#14f1d9');
  }, [data.settings.accent]);

  const api = useMemo(() => {
    function createPlan(name) {
      const now = new Date().toISOString();
      const plan = { id: uid('plan'), name, exercises: [], createdAt: now, updatedAt: now };
      setData((prev) => ({ ...prev, plans: [plan, ...prev.plans] }));
      return plan;
    }

    function updatePlan(planId, patch) {
      setData((prev) => ({
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? { ...plan, ...patch, updatedAt: new Date().toISOString() }
            : plan
        )
      }));
    }

    function deletePlan(planId) {
      setData((prev) => ({
        ...prev,
        plans: prev.plans.filter((plan) => plan.id !== planId)
      }));
    }

    function addExerciseToPlan(planId, exerciseId) {
      const exercise = exercises.find((x) => x.id === exerciseId);
      if (!exercise) return;
      const item = {
        id: uid('item'),
        exerciseId,
        sets: 3,
        reps: 10,
        weight: 0,
        restSec: 60
      };
      setData((prev) => ({
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                exercises: [...plan.exercises, item],
                updatedAt: new Date().toISOString()
              }
            : plan
        )
      }));
    }

    function updatePlanExercise(planId, itemId, patch) {
      setData((prev) => ({
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                exercises: plan.exercises.map((item) =>
                  item.id === itemId ? { ...item, ...patch } : item
                ),
                updatedAt: new Date().toISOString()
              }
            : plan
        )
      }));
    }

    function removePlanExercise(planId, itemId) {
      setData((prev) => ({
        ...prev,
        plans: prev.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                exercises: plan.exercises.filter((item) => item.id !== itemId),
                updatedAt: new Date().toISOString()
              }
            : plan
        )
      }));
    }

    function appendSession(session) {
      setData((prev) => ({ ...prev, sessions: [session, ...prev.sessions] }));
    }

    function updateSettings(patch) {
      setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    }

    return {
      plans: data.plans,
      sessions: data.sessions,
      settings: data.settings,
      exercises,
      createPlan,
      updatePlan,
      deletePlan,
      addExerciseToPlan,
      updatePlanExercise,
      removePlanExercise,
      appendSession,
      updateSettings
    };
  }, [data, exercises]);

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return ctx;
}
