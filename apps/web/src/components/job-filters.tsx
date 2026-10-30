import { formatSalary } from '@/lib/format';
import type { SkillCount } from '@/lib/types';

export const MAX_SALARY_FILTER = 200_000;
export const SALARY_STEP = 5_000;

interface JobFiltersProps {
  skills: SkillCount[] | undefined;
  skillsError: string | undefined;
  selectedSkills: string[];
  onToggleSkill: (name: string) => void;
  remoteOnly: boolean;
  onRemoteOnlyChange: (value: boolean) => void;
  minSalary: number;
  onMinSalaryChange: (value: number) => void;
  location: string;
  onLocationChange: (value: string) => void;
  activeCount: number;
  onClear: () => void;
}

export function JobFilters(props: JobFiltersProps) {
  const { skills, skillsError, selectedSkills } = props;

  return (
    <aside className="filters" aria-label="Filter jobs">
      <div className="filters__header">
        <h2>Filters</h2>
        <button type="button" className="link-button" onClick={props.onClear} disabled={props.activeCount === 0}>
          Clear all{props.activeCount > 0 ? ` (${props.activeCount})` : ''}
        </button>
      </div>

      <fieldset className="filter-group">
        <legend>Skills</legend>
        {skillsError && <p className="muted">Skills unavailable.</p>}
        {!skills && !skillsError && <p className="muted">Loading skills...</p>}
        {skills && (
          <ul className="skill-filters">
            {skills.map((skill) => (
              <li key={skill.name}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    data-testid={`skill-filter-${skill.name}`}
                    checked={selectedSkills.includes(skill.name)}
                    onChange={() => props.onToggleSkill(skill.name)}
                  />
                  <span>{skill.name}</span>
                  <span className="count">{skill.count}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Work style</legend>
        <label className="checkbox">
          <input
            type="checkbox"
            data-testid="remote-filter"
            checked={props.remoteOnly}
            onChange={(e) => props.onRemoteOnlyChange(e.target.checked)}
          />
          <span>Remote only</span>
        </label>
      </fieldset>

      <div className="filter-group">
        <label htmlFor="salary-filter" className="filter-label">
          Minimum salary
        </label>
        <input
          id="salary-filter"
          type="range"
          min={0}
          max={MAX_SALARY_FILTER}
          step={SALARY_STEP}
          value={props.minSalary}
          data-testid="salary-filter"
          onChange={(e) => props.onMinSalaryChange(Number(e.target.value))}
          className="range"
        />
        <output htmlFor="salary-filter" className="range-output">
          {props.minSalary > 0 ? `From ${formatSalary(props.minSalary)}` : 'Any salary'}
        </output>
      </div>

      <div className="filter-group">
        <label htmlFor="location-filter" className="filter-label">
          Location
        </label>
        <input
          id="location-filter"
          type="text"
          placeholder="e.g. Berlin, Remote"
          value={props.location}
          data-testid="location-filter"
          onChange={(e) => props.onLocationChange(e.target.value)}
          className="input"
        />
      </div>
    </aside>
  );
}
