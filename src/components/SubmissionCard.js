export default function SubmissionCard({ submission }) {
  const statusColors = {
    pending: 'bg-blue-500 shadow-[0_0_6px] shadow-blue-500',
    accepted: 'bg-emerald-500',
    denied: 'bg-red-500',
  }

  return (
    <div className="block bg-stone-800 rounded-lg p-5 border border-stone-700 opacity-90">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-stone-100 font-semibold truncate">{submission.botName}</h3>
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${statusColors[submission.status] || 'bg-stone-500'}`}
          title={submission.status}
        />
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-stone-500">Status</span>
          <span className={`capitalize ${
            submission.status === 'pending' ? 'text-blue-400' :
            submission.status === 'accepted' ? 'text-emerald-400' :
            submission.status === 'denied' ? 'text-red-400' : 'text-stone-300'
          }`}>
            {submission.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Submitted</span>
          <span className="text-stone-300">{new Date(submission.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Purpose</span>
          <span className="text-stone-300 truncate ml-2 max-w-[140px]">{submission.botPurpose}</span>
        </div>
      </div>
    </div>
  )
}
