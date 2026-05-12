import {
  getRecurrenceType,
  WEEK_DAYS,
  MONTH_NAMES,
  WEEK_OF_MONTH_LABELS,
  WEEK_OF_MONTH_VALUES,
} from '../../utils/recurrence';

const s = {
  row: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  label: {
    width: 80, paddingTop: 6, display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'var(--color-text-tertiary)', flexShrink: 0,
  },
  content: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
  },
  modeToggle: (active) => ({
    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
    border: '1px solid ' + (active ? 'var(--color-accent)' : 'var(--color-border)'),
    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    fontSize: 12, fontWeight: 500,
    transition: 'all 160ms var(--ease)',
  }),
  dayBtn: (active) => ({
    width: 32, height: 28, borderRadius: 6,
    border: '1px solid ' + (active ? 'var(--color-accent)' : 'var(--color-border)'),
    background: active ? 'var(--color-accent)' : 'var(--color-surface)',
    color: active ? '#fff' : 'var(--color-text-secondary)',
    fontSize: 11, fontWeight: 600,
    transition: 'all 140ms var(--ease)',
  }),
  select: {
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)', borderRadius: 7,
    padding: '5px 10px', fontSize: 12.5,
    color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit',
  },
  caption: {
    fontSize: 11.5, color: 'var(--color-text-tertiary)', lineHeight: 1.4,
  },
};

function WeekDayPicker({ recurrence, onChange }) {
  const isMulti = recurrence.weekdayMode === 'multi';
  const selected = recurrence.weekdays || [];

  const toggleMode = (mode) => {
    const next = { ...recurrence, weekdayMode: mode };
    if (mode === 'single' && selected.length > 1) {
      next.weekdays = [selected[0]];
    }
    onChange(next);
  };

  const toggleDay = (dow) => {
    if (!isMulti) {
      onChange({ ...recurrence, weekdays: [dow] });
      return;
    }
    const next = selected.includes(dow)
      ? selected.filter((d) => d !== dow)
      : [...selected, dow];
    if (next.length === 0) return;
    onChange({ ...recurrence, weekdays: next });
  };

  return (
    <div style={s.content}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={s.modeToggle(!isMulti)} onClick={() => toggleMode('single')}>Single day</button>
        <button style={s.modeToggle(isMulti)} onClick={() => toggleMode('multi')}>Multiple days</button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {WEEK_DAYS.map((name, dow) => (
          <button key={dow} style={s.dayBtn(selected.includes(dow))} onClick={() => toggleDay(dow)}>
            {name.slice(0, 2)}
          </button>
        ))}
      </div>
    </div>
  );
}

function MonthlyRulePicker({ recurrence, onChange }) {
  const isDate = recurrence.monthlyMode === 'date';

  const setMode = (mode) => onChange({ ...recurrence, monthlyMode: mode });

  return (
    <div style={s.content}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={s.modeToggle(isDate)} onClick={() => setMode('date')}>Same date</button>
        <button style={s.modeToggle(!isDate)} onClick={() => setMode('weekday')}>Same weekday</button>
      </div>
      {isDate ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={s.caption}>Day</span>
          <input
            type="number"
            min={1} max={31}
            value={recurrence.dayOfMonth || 1}
            onChange={(e) => onChange({ ...recurrence, dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value))) })}
            style={{ ...s.select, width: 60 }}
          />
          <span style={s.caption}>of the month</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={s.caption}>The</span>
          <select
            value={recurrence.weekOfMonth || 1}
            onChange={(e) => onChange({ ...recurrence, weekOfMonth: Number(e.target.value) })}
            style={s.select}
          >
            {WEEK_OF_MONTH_VALUES.map((v, i) => (
              <option key={v} value={v}>{WEEK_OF_MONTH_LABELS[i]}</option>
            ))}
          </select>
          <select
            value={recurrence.weekday ?? 0}
            onChange={(e) => onChange({ ...recurrence, weekday: Number(e.target.value) })}
            style={s.select}
          >
            {WEEK_DAYS.map((name, dow) => (
              <option key={dow} value={dow}>{name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default function RecurrencePicker({ listId, recurrence, onChange }) {
  const type = getRecurrenceType(listId);
  if (!type) return null;

  if (type === 'daily') {
    return (
      <div style={s.row}>
        <div style={s.label}>Repeat</div>
        <div style={{ ...s.caption, paddingTop: 6 }}>Every day</div>
      </div>
    );
  }

  if (!recurrence) return null;

  if (type === 'weekly') {
    return (
      <div style={s.row}>
        <div style={s.label}>Repeat</div>
        <WeekDayPicker recurrence={recurrence} onChange={onChange} />
      </div>
    );
  }

  if (type === 'monthly') {
    return (
      <div style={s.row}>
        <div style={s.label}>Repeat</div>
        <MonthlyRulePicker recurrence={recurrence} onChange={onChange} />
      </div>
    );
  }

  if (type === 'quarterly') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={s.row}>
          <div style={s.label}>Repeat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
            <span style={s.caption}>Month</span>
            <select
              value={recurrence.quarterMonth || 1}
              onChange={(e) => onChange({ ...recurrence, quarterMonth: Number(e.target.value) })}
              style={s.select}
            >
              <option value={1}>1st of quarter</option>
              <option value={2}>2nd of quarter</option>
              <option value={3}>3rd of quarter</option>
            </select>
          </div>
        </div>
        <div style={s.row}>
          <div style={s.label} />
          <MonthlyRulePicker recurrence={recurrence} onChange={onChange} />
        </div>
      </div>
    );
  }

  if (type === 'annually') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={s.row}>
          <div style={s.label}>Repeat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
            <select
              value={recurrence.month ?? 0}
              onChange={(e) => onChange({ ...recurrence, month: Number(e.target.value) })}
              style={s.select}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={s.row}>
          <div style={s.label} />
          <MonthlyRulePicker recurrence={recurrence} onChange={onChange} />
        </div>
      </div>
    );
  }

  return null;
}
