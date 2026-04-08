import { useState } from 'react'
import OrderCard from './OrderCard'
import { Search, FileX2 } from 'lucide-react'

function OrderList({ orders, onUpdateStatus, userName }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = orders.filter(order => 
    order.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto items-start pb-20 space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          <Search className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Search active orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[20px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium hover:border-slate-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] placeholder:select-none"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </div>
        </div>
      </div>
      <div className="bg-slate-50/50 rounded-[24px] p-4 lg:p-6 border border-slate-200 shadow-sm min-h-[500px]">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 h-full text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
              <FileX2 className="w-10 h-10 opacity-40 text-slate-500" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-lg text-slate-600 mb-2 tracking-tight">No orders found for {userName}</p>
            <p className="text-sm font-medium">Create an order or try searching for a different item name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 animate-in fade-in duration-500">
            {filteredOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <OrderCard 
                  order={order} 
                  onUpdateStatus={onUpdateStatus}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderList
