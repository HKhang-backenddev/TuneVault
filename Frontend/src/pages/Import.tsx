import { useState } from 'react';

const ImportPage = () => {
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    setStatus('Submitting...');
    const res = await fetch('/api/import/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    if (!res.ok) { setStatus('Failed to submit'); return; }
    const data = await res.json();
    setJobId(data.jobId);
    setStatus('Queued');
    poll(data.jobId);
  };

  const poll = async (id: string) => {
    setStatus('Checking...');
    const res = await fetch(`/api/import/status/${id}`);
    if (!res.ok) { setStatus('Status not found'); return; }
    const s = await res.json();
    setStatus(s.state);
    if (s.state === 'InProgress' || s.state === 'Queued') {
      setTimeout(() => poll(id), 2000);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Import track</h1>
      <p className="text-neutral-400 mt-2">Paste a YouTube or SoundCloud URL to import audio to the server.</p>
      <div className="mt-4 flex space-x-2">
        <input className="flex-1 p-2 bg-neutral-800 rounded" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
        <button className="px-4 py-2 bg-green-500 rounded" onClick={submit}>Import</button>
      </div>

      {jobId && (
        <div className="mt-4">
          <div>Job: {jobId}</div>
          <div>Status: {status}</div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
