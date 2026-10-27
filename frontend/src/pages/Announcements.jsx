
import { useEffect, useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('ems_token');

  async function loadAnnouncements() {
    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setItems(Array.isArray(data) ? data : data.announcements || []);
      } else {
        setNotice(data.message || 'Could not load announcements');
      }
    } catch {
      setNotice('Backend connection failed');
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function publish(e) {
    e.preventDefault();
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();

      setNotice(
        data.message ||
          (res.ok ? 'Announcement published successfully' : 'Publish failed')
      );

      if (res.ok) {
        setTitle('');
        setMessage('');
        await loadAnnouncements();
      }
    } catch {
      setNotice('Backend connection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Announcements
            </h1>
            <p className="mt-2 text-gray-500">
              Share important updates with your team.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            📢 Team Updates
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {notice}
          </div>
        )}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-gray-900">
            Publish Announcement
          </h2>
          <p className="mb-6 mt-1 text-sm text-gray-500">
            Create an update for your organization.
          </p>

          <form onSubmit={publish} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Announcement Title
              </label>
              <input
                required
                maxLength={120}
                className={inputClass}
                placeholder="e.g. Important Team Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                required
                rows={4}
                maxLength={3000}
                className={inputClass}
                placeholder="Write your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : '＋ Publish Announcement'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Announcements
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Latest updates shared with the team.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAnnouncements}
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                    📢
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {item.message || item.content}
                    </p>
                    {item.createdAt && (
                      <p className="mt-3 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {items.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                <div className="text-3xl">📢</div>
                <p className="mt-3 font-semibold text-gray-700">
                  No announcements yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Published updates will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
