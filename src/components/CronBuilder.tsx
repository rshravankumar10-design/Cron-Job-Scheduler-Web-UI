import { useState } from 'react';

// Minimal parse result type for demo purposes
export interface ParseResult {
  isValid: boolean;
  expression?: string;
  description?: string;
  error?: string;
}

export function parseNaturalLanguage(input: string): ParseResult {
  // Very small demo parser
  const normalized = input.toLowerCase();
  if (normalized.includes('every 10 minutes')) {
    return { isValid: true, expression: '*/10 * * * *', description: 'Every 10 minutes' };
  }
  return { isValid: false, error: 'Unsupported input' };
}

export function getNextRuns(): Date[] {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => new Date(now.getTime() + (i + 1) * 60000));
}

export default function CronBuilder() {
  const [input, setInput] = useState('every 10 minutes');
  const [result, setResult] = useState<ParseResult | null>(null);

  const handleParse = () => setResult(parseNaturalLanguage(input));

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Cron Builder (demo)</h1>
      <div className="flex gap-2 mb-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded" />
        <button onClick={handleParse} className="px-4 py-2 bg-blue-600 text-white rounded">Parse</button>
      </div>
      {result && (
        <div className="mt-4">
          {result.isValid ? (
            <div>
              <div className="font-mono">{result.expression}</div>
              <div className="text-sm text-slate-500">{result.description}</div>
            </div>
          ) : (
            <div className="text-red-500">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
       