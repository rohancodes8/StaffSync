
import { useEffect, useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

const primaryButton =
  'inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50';

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee: '',
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('ems_token');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch('http://localhost:5000/api/employees', { headers })
      .then((res) => res.json())
      .then((data) =>
        setEmployees(Array.isArray(data) ? data : data.employees || [])
      )
      .catch(() => {});

    loadLeaves();
  }, []);

  async function loadLeaves() {
    try {
      const res = await fetch('http://localhost:5000/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        setMessage(data.message || 'Could not load leave requests');
      }
    } catch {
      setMessage('Unable to connect to the backend.');
    }
  }

  async function submitLeave(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message || (res.ok ? 'Leave request submitted!' : 'Request failed'));

      if (res.ok) {
        setForm({
          employee: '',
          leaveType: 'Casual',
          startDate: '',
          endDate: '',
          reason: '',
        });
        await loadLeaves();
      }
    } catch {
      setMessage('Unable to connect to the backend.');
    } finally {
      setLoading(false);
    }
  }

  async function reviewLeave(id, status) {
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      setMessage(data.message || 'Review complete');

      if (res.ok) await loadLeaves();
    } catch {
      setMessage('Unable to process the review.');
    }
  }

  const labelClass = 'mb-2 block text-sm font-medium text-gray-700';

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Leave Management
            </h1>
            <p className="mt-2 text-gray-500">
              Manage employee leave requests and approvals.
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            📅 Leave Center
          </div>
        </header>

        {message && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the employee and leave details below.
            </p>
          </div>

          <form onSubmit={submitLeave} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Employee</label>
                <select
                  required
                  className={inputClass}
                  value={form.employee}
                  onChange={(e) =>
                    setForm({ ...form, employee: e.target.value })
                  }
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Leave Type</label>
                <select
                  className={inputClass}
                  value={form.leaveType}
                  onChange={(e) =>
                    setForm({ ...form, leaveType: e.target.value })
                  }
                >
                  <option>Casual</option>
                  <option>Sick</option>
                  <option>Earned</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Start Date</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className={labelClass}>End Date</label>
                <input
                  type="date"
                  required
                  min={form.startDate || undefined}
                  className={inputClass}
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Reason</label>
              <textarea
                required
                rows={3}
                className={inputClass}
                placeholder="Enter the reason for leave..."
                value={form.reason}
                onChange={(e) =>
                  setForm({ ...form, reason: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? 'Submitting...' : '＋ Submit Leave Request'}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leave Requests</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review and track submitted requests.
              </p>
            </div>
            <button
              type="button"
              onClick={loadLeaves}
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              ↻ Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  {['Employee', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-5 py-4 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </td>
                    <td className="px-5 py-4">{leave.leaveType}</td>
                    <td className="px-5 py-4">{leave.startDate?.slice(0, 10)}</td>
                    <td className="px-5 py-4">{leave.endDate?.slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : leave.status === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {leave.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => reviewLeave(leave._id, 'Approved')}
                            className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewLeave(leave._id, 'Rejected')}
                            className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
