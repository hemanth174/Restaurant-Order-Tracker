import { useState } from 'react'
import { Plus, Hash, Pizza } from 'lucide-react'

function OrderForm({ onCreateOrder }) {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (itemName.trim()) {
      const created = await onCreateOrder(itemName, quantity)
      if (created) {
        setItemName('')
        setQuantity(1)
      }
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] mx-auto max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 outline outline-4 outline-emerald-50/50">
          <Plus className="w-5 h-5" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add New Order</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Pizza className="w-5 h-5" strokeWidth={2} />
          </div>
          <input
            type="text"
            placeholder="What's the order? (e.g., Double Cheeseburger)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-[16px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium hover:bg-slate-50"
          />
        </div>
        
        <div className="relative w-full md:w-36 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Hash className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
          </div>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-[16px] text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium hover:bg-slate-50"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-[16px] text-base font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 focus:ring-4 focus:ring-emerald-500/30 focus:outline-none transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Send to Kitchen</span>
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  )
}

export default OrderForm
