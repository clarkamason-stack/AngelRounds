import { useEffect, useMemo, useState } from 'react';
import { CHECKLIST_QUESTIONS, COMMON_ROOMS, RESIDENT_QUESTIONS, ROUND_ITEMS } from './data';
import type { Answer, ResponseItem, SubmitPayload } from './types';

type Screen = 'home' | 'round' | 'summary' | 'success';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
const ROUNDER_KEY = 'guardian-angel-rounder-name';

function emptyResponses(): ResponseItem[] {
  return ROUND_ITEMS.map((item) => ({
    ...item,
    answer: '',
    note: ''
  }));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [room, setRoom] = useState('100');
  const [customRoom, setCustomRoom] = useState('');
  const [rounderName, setRounderName] = useState('');
  const [responses, setResponses] = useState<ResponseItem[]>(emptyResponses);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noteDraft, setNoteDraft] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setRounderName(localStorage.getItem(ROUNDER_KEY) || '');
  }, []);

  useEffect(() => {
    localStorage.setItem(ROUNDER_KEY, rounderName);
  }, [rounderName]);

  const roomOrResident = room === 'Other' ? customRoom.trim() : room;
  const answeredCount = responses.filter((item) => item.answer).length;
  const current = responses[currentIndex];

  const canStart = roomOrResident.length > 0;

  const payload: SubmitPayload = useMemo(
    () => ({
      timestamp: new Date().toISOString(),
      roomOrResident,
      rounderName: rounderName.trim(),
      items: responses
    }),
    [responses, roomOrResident, rounderName]
  );

  function startRound() {
    if (!canStart) return;
    setResponses(emptyResponses());
    setCurrentIndex(0);
    setSubmitError('');
    setScreen('round');
  }

  function answerCurrent(answer: Answer) {
    setResponses((items) =>
      items.map((item, index) => (index === currentIndex ? { ...item, answer } : item))
    );

    if (currentIndex < responses.length - 1) {
      window.setTimeout(() => setCurrentIndex((index) => Math.min(index + 1, responses.length - 1)), 120);
    } else {
      window.setTimeout(() => setScreen('summary'), 120);
    }
  }

  function openNote() {
    setNoteDraft(current.note);
    setIsNoteOpen(true);
  }

  function saveNote() {
    setResponses((items) =>
      items.map((item, index) => (index === currentIndex ? { ...item, note: noteDraft } : item))
    );
    setIsNoteOpen(false);
  }

  function updateSummaryItem(index: number, updates: Partial<ResponseItem>) {
    setResponses((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item))
    );
  }

  async function submitRound() {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      if (GOOGLE_SCRIPT_URL) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } else {
        console.info('No VITE_GOOGLE_SCRIPT_URL set. Payload:', payload);
      }

      setScreen('success');
    } catch {
      setSubmitError('Unable to submit right now. Check your connection and Google Apps Script URL.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (screen === 'home') {
    return (
      <main className="min-h-dvh bg-angel-cream text-angel-ink">
        <section className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-8">
          <div className="mb-9 text-center">
            <AngelWings />
            <h1 className="mt-4 text-5xl font-black leading-none tracking-normal text-angel-ink">
              Guardian Angel Rounds
            </h1>
            <p className="mt-4 text-xl font-semibold text-slate-600">
              {RESIDENT_QUESTIONS.length + CHECKLIST_QUESTIONS.length} prompts, built for quick bedside rounds.
            </p>
          </div>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-lg font-bold">Room</span>
              <select
                className="field h-16"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
              >
                {COMMON_ROOMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {room === 'Other' && (
              <label className="block">
                <span className="mb-2 block text-lg font-bold">Custom room or resident</span>
                <input
                  className="field h-16"
                  value={customRoom}
                  onChange={(event) => setCustomRoom(event.target.value)}
                  placeholder="Enter room or resident"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-lg font-bold">Rounder name</span>
              <input
                className="field h-16"
                value={rounderName}
                onChange={(event) => setRounderName(event.target.value)}
                placeholder="Optional"
              />
            </label>

            <button
              className="h-20 w-full rounded-[8px] bg-angel-sage text-2xl font-black text-white shadow-soft transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!canStart}
              onClick={startRound}
            >
              Start Round
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'round') {
    return (
      <main className="flex h-dvh flex-col overflow-hidden bg-angel-cream text-angel-ink">
        <header className="safe-top flex items-center justify-between px-5 pb-3 pt-4">
          <div className="text-lg font-black text-angel-teal">
            {currentIndex + 1} of {responses.length}
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-base font-bold shadow-sm">
            Room {roomOrResident}
          </div>
        </header>

        <div className="h-2 bg-teal-100">
          <div
            className="h-full bg-angel-teal transition-all"
            style={{ width: `${((currentIndex + 1) / responses.length) * 100}%` }}
          />
        </div>

        <section className="flex flex-1 flex-col px-5 py-4">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <h2 className="text-center text-[clamp(2.1rem,8vw,4.8rem)] font-black leading-tight tracking-normal">
              {current.question}
            </h2>
          </div>

          <div className="space-y-3 pb-3">
            <AnswerButton label="YES" className="bg-emerald-500" onClick={() => answerCurrent('YES')} />
            <AnswerButton label="NO" className="bg-red-500" onClick={() => answerCurrent('NO')} />
            <AnswerButton label="N/A" className="bg-slate-500" onClick={() => answerCurrent('N/A')} />
          </div>

          <button
            className="mx-auto min-h-12 px-5 text-lg font-black text-angel-teal underline-offset-4 active:scale-95"
            onClick={openNote}
          >
            {current.note ? 'Edit Note' : 'Add Note'}
          </button>

          <nav className="safe-bottom grid grid-cols-2 gap-3 pt-2">
            <button
              className="secondary-button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            >
              Back
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                currentIndex === responses.length - 1
                  ? setScreen('summary')
                  : setCurrentIndex((index) => Math.min(responses.length - 1, index + 1))
              }
            >
              {currentIndex === responses.length - 1 ? 'Summary' : 'Next'}
            </button>
          </nav>
        </section>

        {isNoteOpen && (
          <NoteModal
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onClose={() => setIsNoteOpen(false)}
            onSave={saveNote}
          />
        )}
      </main>
    );
  }

  if (screen === 'summary') {
    return (
      <main className="min-h-dvh bg-angel-cream px-4 py-5 text-angel-ink">
        <section className="mx-auto max-w-3xl">
          <header className="sticky top-0 z-10 -mx-4 bg-angel-cream/95 px-4 pb-4 pt-3 backdrop-blur">
            <div className="flex items-end justify-between gap-3">
              <div>
                <button className="mb-3 text-lg font-black text-angel-teal" onClick={() => setScreen('round')}>
                  Back to questions
                </button>
                <h1 className="text-4xl font-black tracking-normal">Summary</h1>
                <p className="mt-1 text-lg font-semibold text-slate-600">
                  {answeredCount} of {responses.length} answered for {roomOrResident}
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-4 pb-32">
            {responses.map((item, index) => (
              <article key={item.question} className="rounded-[8px] border border-teal-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-black uppercase tracking-normal text-angel-teal">
                  {index + 1}. {item.section}
                </p>
                <h2 className="mt-2 text-xl font-black leading-snug">{item.question}</h2>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(['YES', 'NO', 'N/A'] as Answer[]).map((answer) => (
                    <button
                      key={answer}
                      className={`min-h-14 rounded-[8px] text-lg font-black ${
                        item.answer === answer ? answerClass(answer) : 'bg-slate-100 text-slate-700'
                      }`}
                      onClick={() => updateSummaryItem(index, { answer })}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
                <textarea
                  className="mt-3 min-h-20 w-full rounded-[8px] border-2 border-slate-200 bg-white p-3 text-lg font-semibold outline-none focus:border-angel-teal"
                  value={item.note}
                  onChange={(event) => updateSummaryItem(index, { note: event.target.value })}
                  placeholder="Note"
                />
              </article>
            ))}
          </div>

          <footer className="safe-bottom fixed inset-x-0 bottom-0 border-t border-teal-100 bg-angel-cream/95 p-4 backdrop-blur">
            <div className="mx-auto max-w-3xl">
              {submitError && <p className="mb-2 text-base font-bold text-red-600">{submitError}</p>}
              <button
                className="h-18 min-h-20 w-full rounded-[8px] bg-angel-sage text-2xl font-black text-white shadow-soft transition active:scale-[0.98] disabled:bg-slate-300"
                disabled={isSubmitting}
                onClick={submitRound}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Round'}
              </button>
            </div>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-angel-cream px-6 text-center text-angel-ink">
      <Confetti />
      <section className="relative z-10 mx-auto max-w-md">
        <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-emerald-500 text-7xl font-black text-white shadow-soft">
          ✓
        </div>
        <h1 className="mt-8 text-5xl font-black leading-tight tracking-normal">Round Submitted Successfully</h1>
        <p className="mt-5 text-xl font-semibold text-slate-600">
          Data saved to Google Sheets for {roomOrResident}.
        </p>
        <button
          className="mt-9 h-18 min-h-20 w-full rounded-[8px] bg-angel-sage px-6 text-2xl font-black text-white shadow-soft active:scale-[0.98]"
          onClick={() => setScreen('home')}
        >
          Start Another Round
        </button>
      </section>
    </main>
  );
}

function AngelWings() {
  return (
    <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-white shadow-soft" aria-hidden="true">
      <svg viewBox="0 0 120 80" className="h-16 w-20">
        <path
          d="M43 39C26 26 12 29 4 47c24 2 39-4 47-20-4 20 5 35 25 45-27 0-49 8-66 24 38 12 70 1 92-34 7-11 7-23 0-35-12-20-47-20-59 12Z"
          fill="#14B8A6"
          opacity="0.24"
        />
        <path
          d="M77 39c17-13 31-10 39 8-24 2-39-4-47-20 4 20-5 35-25 45 27 0 49 8 66 24-38 12-70 1-92-34-7-11-7-23 0-35 12-20 47-20 59 12Z"
          fill="#14B8A6"
          opacity="0.38"
          transform="translate(120 0) scale(-1 1)"
        />
        <path d="M43 12c0-10 34-10 34 0 0 8-34 8-34 0Z" fill="none" stroke="#F6D878" strokeWidth="6" />
      </svg>
    </div>
  );
}

function AnswerButton({ label, className, onClick }: { label: string; className: string; onClick: () => void }) {
  return (
    <button
      className={`min-h-20 w-full rounded-[8px] text-3xl font-black text-white shadow-soft transition active:scale-[0.98] ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function NoteModal({
  noteDraft,
  setNoteDraft,
  onClose,
  onSave
}: {
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-angel-ink/45 p-3 sm:items-center sm:justify-center">
      <div className="w-full rounded-[8px] bg-white p-5 shadow-soft sm:max-w-lg">
        <h2 className="text-3xl font-black">Note</h2>
        <textarea
          className="mt-4 min-h-48 w-full rounded-[8px] border-2 border-slate-200 p-4 text-xl font-semibold outline-none focus:border-angel-teal"
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
          autoFocus
          placeholder="Type quick note"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="secondary-button border-angel-teal bg-angel-teal text-white" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, index) => index);

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {pieces.map((piece) => (
        <span
          key={piece}
          className="confetti-piece"
          style={{
            left: `${(piece * 29) % 100}%`,
            animationDelay: `${(piece % 9) * 0.14}s`,
            backgroundColor: ['#14B8A6', '#7FA582', '#F6D878', '#22C55E'][piece % 4]
          }}
        />
      ))}
    </div>
  );
}

function answerClass(answer: Answer) {
  if (answer === 'YES') return 'bg-emerald-500 text-white';
  if (answer === 'NO') return 'bg-red-500 text-white';
  return 'bg-slate-500 text-white';
}
