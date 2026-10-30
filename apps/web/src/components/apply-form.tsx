'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { postJson } from '@/lib/api';
import type { Application } from '@/lib/types';

interface ApplyFormProps {
  jobId: number;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState<Application>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const note = String(form.get('note') ?? '').trim();

    setSubmitting(true);
    setError(undefined);
    try {
      const application = await postJson<Application>(`/jobs/${jobId}/applications`, {
        candidateName: String(form.get('candidateName') ?? ''),
        candidateEmail: String(form.get('candidateEmail') ?? ''),
        note: note || undefined,
      });
      setSubmitted(application);
    } catch (err) {
      // 400 and 409 responses carry the reason in the API's message, which is shown as-is.
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="panel" aria-labelledby="apply-heading">
        <h2 id="apply-heading">Application sent</h2>
        <div className="notice notice--success" data-testid="apply-success" role="status">
          <p>
            Thanks, {submitted.candidateName}. Your application for {jobTitle} is in the pipeline.
          </p>
        </div>
        <Link href="/employer" className="button button--secondary">
          View the hiring pipeline
        </Link>
      </section>
    );
  }

  return (
    <section className="panel" aria-labelledby="apply-heading">
      <h2 id="apply-heading">Apply for this role</h2>
      <form className="form" data-testid="apply-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Full name</span>
          <input
            name="candidateName"
            type="text"
            className="input"
            autoComplete="name"
            required
            maxLength={120}
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            name="candidateEmail"
            type="email"
            className="input"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label className="field">
          <span>Note to the hiring team (optional)</span>
          <textarea name="note" className="input input--textarea" rows={4} maxLength={1000} />
        </label>

        {error && (
          <p className="notice notice--error" data-testid="apply-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? 'Sending...' : 'Submit application'}
        </button>
      </form>
    </section>
  );
}
