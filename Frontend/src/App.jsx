import { useState, useEffect } from 'react'
import axios from 'axios'
import OrderForm from './components/OrderForm'
import OrderList from './components/OrderList'
import { UtensilsCrossed } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/orders'

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL)
      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    }finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCreateOrder = async (itemName, quantity) => {
    try {
      const response = await axios.post(API_URL, { item_name: itemName, quantity })
      setOrders([response.data, ...orders])
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const handleUpdateStatus = async (orderId) => {
    try {
      const response = await axios.patch(`${API_URL}/${orderId}/status`)
      setOrders(orders.map(order => 
        order.id === orderId ? response.data : order
      ))
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <UtensilsCrossed className="w-10 h-10 text-emerald-500 animate-bounce" />
          <p className="text-lg font-medium text-slate-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <UtensilsCrossed className="w-8 h-8 text-emerald-500 relative z-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 text-center">
            Order Dashboard
          </h1>
          <p className="text-slate-500 font-medium text-center max-w-lg">
            Manage and track customer orders in real-time with our sleek processing board.
          </p>
        </header>

        <main className="space-y-10">
          <OrderForm onCreateOrder={handleCreateOrder} />
          <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
        </main>
        
      </div>
    </div>
  )
}

export default App
