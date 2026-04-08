import { useState, useEffect } from 'react'
import axios from 'axios'
import OrderForm from './components/OrderForm'
import OrderList from './components/OrderList'
import { UtensilsCrossed, AlertCircle, CheckCircle2, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const ORDERS_API = `${API_BASE}/api/orders`

const getBackendMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage
}

function StatusBanner({ notification, onClose }) {
  if (!notification) {
    return null
  }

  const isSuccess = notification.type === 'success'

  return (
    <div
      className={`mb-8 flex items-start gap-3 rounded-[20px] border px-5 py-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-rose-200 bg-rose-50 text-rose-900'
      }`}
    >
      <div className={`mt-0.5 rounded-full p-1 ${isSuccess ? 'bg-emerald-100' : 'bg-rose-100'}`}>
        {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{isSuccess ? 'Success' : 'Error'}</p>
        <p className="text-sm font-medium opacity-90">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        aria-label="Close message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!notification) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setNotification(null)
    }, 4000)

    return () => window.clearTimeout(timeoutId)
  }, [notification])

  const showMessage = (type, message) => {
    setNotification({ type, message })
  }

  const fetchOrders = async () => {
    try {
      const response = await axios.get(ORDERS_API)
      setOrders(Array.isArray(response.data?.orders) ? response.data.orders : [])
      showMessage('success', response.data?.message || 'Orders loaded successfully')
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
      showMessage('error', getBackendMessage(error, 'Unable to fetch orders right now'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCreateOrder = async (itemName, quantity) => {
    try {
      const response = await axios.post(ORDERS_API, { item_name: itemName, quantity })
      const newOrder = response.data?.order
      if (newOrder) {
        setOrders(currentOrders => [newOrder, ...currentOrders])
      }
      showMessage('success', response.data?.message || 'Order created successfully')
      return true
    } catch (error) {
      console.error('Error creating order:', error)
      showMessage('error', getBackendMessage(error, 'Unable to create order right now'))
      return false
    }
  }

  const handleUpdateStatus = async (orderId) => {
    try {
      const response = await axios.patch(`${ORDERS_API}/${orderId}/status`)
      const updatedOrder = response.data?.order
      if (updatedOrder) {
        setOrders(currentOrders => currentOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        ))
      }
      showMessage('success', response.data?.message || 'Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      showMessage('error', getBackendMessage(error, 'Unable to update order status right now'))
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

        <StatusBanner notification={notification} onClose={() => setNotification(null)} />

        <main className="space-y-10">
          <OrderForm onCreateOrder={handleCreateOrder} />
          <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
        </main>
      </div>
    </div>
  )
}

export default App
