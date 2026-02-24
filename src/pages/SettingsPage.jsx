import { useAppData } from '../lib/app-data';

const accentOptions = ['#14f1d9', '#52f5a0', '#62c6ff', '#ff5ac8'];

export default function SettingsPage() {
  const { settings, updateSettings } = useAppData();

  return (
    <section className="stack">
      <article className="card stack">
        <h2>Settings</h2>
        <label>
          Weight unit
          <select
            value={settings.unit}
            onChange={(event) => updateSettings({ unit: event.target.value })}
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </label>

        <label className="row spread">
          Auto start rest timer
          <input
            type="checkbox"
            checked={settings.autoStartRest}
            onChange={(event) => updateSettings({ autoStartRest: event.target.checked })}
          />
        </label>

        <label>
          Accent color
          <div className="row">
            {accentOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`swatch ${settings.accent === color ? 'selected' : ''}`}
                style={{ '--swatch-color': color }}
                aria-label={`Set accent ${color}`}
                onClick={() => updateSettings({ accent: color })}
              />
            ))}
          </div>
        </label>
      </article>
    </section>
  );
}
