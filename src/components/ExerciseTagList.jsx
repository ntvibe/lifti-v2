export default function ExerciseTagList({ tags, label }) {
  if (!tags?.length) return null;

  return (
    <p className="muted-text">
      <strong>{label}:</strong> {tags.join(', ')}
    </p>
  );
}
