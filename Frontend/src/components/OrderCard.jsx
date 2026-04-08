import { Clock, ChefHat, Check, ArrowRight } from 'lucide-react'

const statusConfig = {
  Preparing: {
    cardBg: 'bg-white hover:border-orange-200/50 hover:shadow-orange-500/5',
    indicator: 'bg-gradient-to-b from-orange-400 to-orange-500',
    button: 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 border border-orange-200/50',
    buttonText: 'Mark Ready',
    btnHover: 'hover:shadow-[0_4px_12px_-4px_rgba(249,115,22,0.3)]',
    badge: 'bg-orange-50 text-orange-700 border border-orange-100',
    BtnIcon: ChefHat
  },
  Ready: {
    cardBg: 'bg-white hover:border-blue-200/50 hover:shadow-blue-500/5',
    indicator: 'bg-gradient-to-b from-blue-400 to-blue-500',
    button: 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200/50',
    buttonText: 'Complete',
    btnHover: 'hover:shadow-[0_4px_12px_-4px_rgba(59,130,246,0.3)]',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100',
    BtnIcon: Check
  },
  Completed: {
    cardBg: 'bg-slate-50 border-slate-200 shadow-none hover:shadow-none hover:border-slate-200',
    indicator: 'bg-slate-300',
    button: '',
    btnHover: '',
    buttonText: '',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    opacity: 'opacity-75 grayscale-[0.2]'
  }
}

function OrderCard({ order, onUpdateStatus }) {
  const config = statusConfig[order.status]
  const CurrentBtnIcon = config.BtnIcon

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`relative p-5 rounded-[20px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 overflow-hidden group ${config.cardBg} ${config.opacity || ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${config.indicator}`}></div>
      
      <div className="flex justify-between items-start mb-4 pl-2">
        <h4 className="text-slate-800 font-bold text-[1.05rem] leading-snug pr-3 group-hover:text-emerald-700 transition-colors">
          {order.item_name}
        </h4>
        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm min-w-max ${config.badge}`}>
          Q: {order.quantity}
        </span>
      </div>
      
      <div className="flex items-center text-slate-500 text-xs font-medium mb-5 pl-2 bg-slate-50/50 py-1.5 px-2 rounded-lg max-w-max border border-slate-100/50">
        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
        Ordered at {formatTime(order.created_at)}
      </div>
      
      {order.status !== 'Completed' && (
        <button 
          onClick={() => onUpdateStatus(order.id)}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn ${config.button} ${config.btnHover}`}
        >
          <CurrentBtnIcon className="w-4 h-4 opacity-70 group-hover/btn:scale-110 group-hover/btn:opacity-100 transition-all" strokeWidth={2.5} />
          <span>{config.buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 group-hover/btn:ml-0 transition-all" strokeWidth={3} />
        </button>
      )}
    </div>
  )
}

export default OrderCard
