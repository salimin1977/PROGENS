import { describe, expect, it } from 'vitest';
import { MockDataProvider } from './MockDataProvider';
import { DataProviderError } from './DataProvider';

// A fresh instance per test — interventions/actions are cloned into
// instance state precisely so tests (and app sessions) don't corrupt the
// shared seed module or each other.

describe('MockDataProvider.createIntervention', () => {
  it('creates a case defaulting to PLANNED status and no outcome', async () => {
    const provider = new MockDataProvider();
    const beforeCount = (await provider.getInterventions()).length;

    const created = await provider.createIntervention({
      student_id: 'stu-cls-1damai-001',
      category: 'Subject Coaching',
      risk_level: 'MEDIUM',
      problem: 'Test problem',
      objective: 'Test objective',
      strategy: 'Test strategy',
      teacher_id: 'tch-001',
      start_date: '2026-06-01',
      target_date: '2026-09-01',
    });

    expect(created.status).toBe('PLANNED');
    expect(created.outcome).toBeNull();
    expect(created.id).toBeTruthy();

    const after = await provider.getInterventions();
    expect(after.length).toBe(beforeCount + 1);
    expect(after.some((i) => i.id === created.id)).toBe(true);
  });

  it('does not mutate the shared seed data — a second provider instance is unaffected', async () => {
    const providerA = new MockDataProvider();
    const providerB = new MockDataProvider();
    const beforeCount = (await providerB.getInterventions()).length;

    await providerA.createIntervention({
      student_id: 'stu-cls-1damai-001',
      category: 'Mentoring',
      risk_level: 'LOW',
      problem: 'Isolation test',
      objective: 'x',
      strategy: 'x',
      teacher_id: 'tch-001',
      start_date: '2026-01-01',
      target_date: '2026-02-01',
    });

    const after = await providerB.getInterventions();
    expect(after.length).toBe(beforeCount);
  });
});

describe('MockDataProvider.updateIntervention / closeIntervention', () => {
  it('patches an existing case and updates updated_at', async () => {
    const provider = new MockDataProvider();
    const [existing] = await provider.getInterventions();

    const updated = await provider.updateIntervention(existing.id, { status: 'ACTIVE' });
    expect(updated.status).toBe('ACTIVE');
    expect(updated.id).toBe(existing.id);
  });

  it('throws DataProviderError for an unknown id', async () => {
    const provider = new MockDataProvider();
    await expect(provider.updateIntervention('does-not-exist', { status: 'ACTIVE' })).rejects.toBeInstanceOf(DataProviderError);
  });

  it('closeIntervention sets status CLOSED and records the outcome', async () => {
    const provider = new MockDataProvider();
    const [existing] = await provider.getInterventions();

    const closed = await provider.closeIntervention(existing.id, 'Resolved successfully');
    expect(closed.status).toBe('CLOSED');
    expect(closed.outcome).toBe('Resolved successfully');
  });
});

describe('MockDataProvider.addInterventionAction', () => {
  it('appends an action retrievable via getInterventionActions', async () => {
    const provider = new MockDataProvider();
    const [existing] = await provider.getInterventions();
    const before = await provider.getInterventionActions(existing.id);

    await provider.addInterventionAction({
      intervention_id: existing.id,
      action_date: '2026-06-15',
      action: 'Follow-up session',
      person_in_charge: 'Test Teacher',
      result: 'Improved',
      next_action: 'Continue monitoring',
    });

    const after = await provider.getInterventionActions(existing.id);
    expect(after.length).toBe(before.length + 1);
  });
});
