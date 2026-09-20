import { useEffect, useRef, useState } from 'react';

import { Send } from 'lucide-react';

import AppLayout from '../components/layout/AppLayout.jsx';
import PageContainer from '../components/layout/PageContainer.jsx';
import Button from '../components/ui/Button.jsx';

import { askCareLens } from '../services/api.js';
import { loadAnalysis } from '../lib/store.js';

const SUGGESTIONS = [
  'Why was this charge flagged?',
  'What is the standard room rate?',
  'Can I request an explanation of this charge?',
];

function replyText(response) {
  if (typeof response === 'string') {
    return response;
  }

  return (
    response?.answer ??
    response?.content ??
    response?.message ??
    response?.reply ??
    'CareLens could not generate an answer.'
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }, [messages, busy]);

  async function send(text) {
    const question = text.trim();

    if (!question || busy) {
      return;
    }

    setInput('');

    setMessages((messages) => [
      ...messages,
      {
        role: 'user',
        content: question,
      },
    ]);

    setBusy(true);

    try {
      const analysis = loadAnalysis();

      const billContext = analysis
        ? {
            bill: analysis.bill,
            validation: analysis.validation,
            discrepancies: analysis.discrepancies,
            evidence: analysis.evidence,
          }
        : null;

      const response = await askCareLens(
        question,
        billContext
      );

      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content: replyText(response),
        },
      ]);
    } catch (error) {
      setMessages((messages) => [
        ...messages,
        {
          role: 'assistant',
          content:
            error?.message ??
            'Something went wrong while getting an answer from CareLens.',
          error: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout
      title="Ask CareLens"
      description="Answers are based on available documentation"
    >
      <PageContainer width="narrow">
        <div
          className="space-y-3"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-accent text-white'
                    : message.error
                    ? 'border border-alert-line bg-alert-soft text-ink'
                    : 'card text-ink'
                }`}
              >
                {message.content}
              </p>
            </div>
          ))}

          {busy ? (
            <p
              className="text-[13px] text-slate-muted"
              role="status"
            >
              CareLens is checking the documents…
            </p>
          ) : null}

          <div ref={endRef} />
        </div>

        {!messages.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                variant="secondary"
                size="sm"
                onClick={() => send(suggestion)}
                disabled={busy}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          <label
            htmlFor="q"
            className="sr-only"
          >
            Your question
          </label>

          <input
            id="q"
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about a charge on your bill"
            className="h-10 flex-1 rounded-md border border-slate-line px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            disabled={busy}
          />

          <Button
            onClick={() => send(input)}
            disabled={
              busy || !input.trim()
            }
          >
            <Send
              size={15}
              aria-hidden="true"
            />
            Send
          </Button>
        </div>
      </PageContainer>
    </AppLayout>
  );
}