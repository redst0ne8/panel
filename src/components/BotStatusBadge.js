const colors = {
  online: 'bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500',
  stopped: 'bg-amber-500',
  errored: 'bg-red-500',
  launching: 'bg-primary-400',
}

export default function BotStatusBadge({ status }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-slate-500'}`}
      title={status}
    />
  )
}
