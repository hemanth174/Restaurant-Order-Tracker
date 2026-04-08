import { useState, useEffect } from 'react'
import axios from 'axios'
import OrderForm from './components/OrderForm'
import OrderList from './components/OrderList'
import { UtensilsCrossed, AlertCircle, CheckCircle2, X, UserCircle2, LogOut, KeyRound } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const ORDERS_API = `${API_BASE}/api/orders`
const USER_STORAGE_KEY = 'restaurant-order-user'

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

function LoginCard({ onLogin }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin(inputValue)
  }

  return (
    <div className="mx-auto max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Choose your username</h2>
          <p className="text-sm font-medium text-slate-500">This keeps each user&apos;s orders separate.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Enter your username"
          className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
        />
        <button
          type="submit"
          className="w-full rounded-[18px] bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 text-base font-bold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-500"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

function App() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_STORAGE_KEY) || '')

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

  const getRequestConfig = (name = userName) => ({
    headers: {
      'x-user-name': name
    }
  })

  const fetchOrders = async () => {
    if (!userName) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(ORDERS_API, getRequestConfig())
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
  }, [userName])

  const handleLogin = (value) => {
    const nextUserName = value.trim()

    if (!nextUserName) {
      showMessage('error', 'Please enter a username')
      return
    }

    localStorage.setItem(USER_STORAGE_KEY, nextUserName)
    setUserName(nextUserName)
    showMessage('success', `Logged in as ${nextUserName}`)
  }

  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUserName('')
    setOrders([])
    setLoading(false)
    showMessage('success', 'Logged out successfully')
  }

  const handleCreateOrder = async (itemName, quantity) => {
    try {
      const response = await axios.post(
        ORDERS_API,
        { item_name: itemName, quantity, user_name: userName },
        getRequestConfig()
      )
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
      const response = await axios.patch(`${ORDERS_API}/${orderId}/status`, {}, getRequestConfig())
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

  if (!userName) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 flex flex-col items-center text-center">
            <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <UtensilsCrossed className="h-8 w-8 text-emerald-500" strokeWidth={2.5} />
            </div>
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Order Dashboard
            </h1>
            <p className="max-w-lg text-center font-medium text-slate-500">
              Enter a username to create and manage only your own restaurant orders.
            </p>
          </header>

          <StatusBanner notification={notification} onClose={() => setNotification(null)} />
          <LoginCard onLogin={handleLogin} />
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

        <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between rounded-[22px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Logged in as</p>
              <p className="text-sm font-bold text-slate-800">{userName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
            Switch User
          </button>
        </div>

        <main className="space-y-10">
          <OrderForm onCreateOrder={handleCreateOrder} />
          <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} userName={userName} />
        </main>
      </div>
    </div>
  )
}

export default App
