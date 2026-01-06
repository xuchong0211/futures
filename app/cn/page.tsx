'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ChineseFuturesData {
  symbol: string
  name: string
  exchange: string
  latestPrice: number
  change: number
  changePercent: number
  volume: number
  openInterest: number
  open: number
  high: number
  low: number
  settlement: number
  tradingDate: string
}

// Mock data structure based on AKShare API format
// This will be replaced with actual API calls
const mockChineseFutures: ChineseFuturesData[] = [
  { symbol: 'rb2501', name: '螺纹钢', exchange: 'SHFE', latestPrice: 3850.00, change: 45.50, changePercent: 1.20, volume: 1250000, openInterest: 2500000, open: 3805.00, high: 3865.00, low: 3795.00, settlement: 3804.50, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'hc2501', name: '热轧卷板', exchange: 'SHFE', latestPrice: 3920.00, change: 32.00, changePercent: 0.82, volume: 850000, openInterest: 1800000, open: 3890.00, high: 3935.00, low: 3880.00, settlement: 3888.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'cu2501', name: '沪铜', exchange: 'SHFE', latestPrice: 72850.00, change: 850.00, changePercent: 1.18, volume: 450000, openInterest: 1200000, open: 72000.00, high: 73000.00, low: 71800.00, settlement: 72000.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'al2501', name: '沪铝', exchange: 'SHFE', latestPrice: 19250.00, change: -125.00, changePercent: -0.65, volume: 320000, openInterest: 850000, open: 19380.00, high: 19400.00, low: 19200.00, settlement: 19375.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'zn2501', name: '沪锌', exchange: 'SHFE', latestPrice: 21850.00, change: 150.00, changePercent: 0.69, volume: 280000, openInterest: 650000, open: 21700.00, high: 21900.00, low: 21650.00, settlement: 21700.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'c2501', name: '玉米', exchange: 'DCE', latestPrice: 2450.00, change: 15.00, changePercent: 0.62, volume: 980000, openInterest: 3200000, open: 2435.00, high: 2460.00, low: 2430.00, settlement: 2435.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'm2501', name: '豆粕', exchange: 'DCE', latestPrice: 3280.00, change: -20.00, changePercent: -0.61, volume: 1250000, openInterest: 2800000, open: 3300.00, high: 3305.00, low: 3270.00, settlement: 3300.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'CF2501', name: '棉花', exchange: 'CZCE', latestPrice: 15850.00, change: 85.00, changePercent: 0.54, volume: 450000, openInterest: 1200000, open: 15765.00, high: 15900.00, low: 15750.00, settlement: 15765.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'TA2501', name: 'PTA', exchange: 'CZCE', latestPrice: 5850.00, change: 25.00, changePercent: 0.43, volume: 850000, openInterest: 1800000, open: 5825.00, high: 5865.00, low: 5815.00, settlement: 5825.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'IF2501', name: '沪深300', exchange: 'CFFEX', latestPrice: 3850.50, change: 12.30, changePercent: 0.32, volume: 125000, openInterest: 85000, open: 3838.20, high: 3855.00, low: 3835.00, settlement: 3838.20, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'IC2501', name: '中证500', exchange: 'CFFEX', latestPrice: 5250.80, change: -15.20, changePercent: -0.29, volume: 98000, openInterest: 65000, open: 5266.00, high: 5270.00, low: 5240.00, settlement: 5266.00, tradingDate: new Date().toISOString().split('T')[0] },
  { symbol: 'sc2501', name: '原油', exchange: 'INE', latestPrice: 585.50, change: 8.50, changePercent: 1.47, volume: 250000, openInterest: 450000, open: 577.00, high: 588.00, low: 575.50, settlement: 577.00, tradingDate: new Date().toISOString().split('T')[0] },
]

const exchangeNames: Record<string, string> = {
  'SHFE': '上海期货交易所',
  'DCE': '大连商品交易所',
  'CZCE': '郑州商品交易所',
  'CFFEX': '中国金融期货交易所',
  'INE': '上海国际能源交易中心',
  'GFEX': '广州期货交易所',
}

export default function ChineseFuturesPage() {
  const [futuresData, setFuturesData] = useState<ChineseFuturesData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/futures/cn')
        const data = await response.json()
        
        if (response.ok) {
          if (Array.isArray(data) && data.length > 0) {
            console.log(`Loaded ${data.length} futures contracts from API`)
            setFuturesData(data)
            setUsingMockData(false)
          } else if (data.error) {
            // API returned an error object
            console.warn('API returned error:', data.error)
            setError(data.message || data.error || 'Failed to fetch data')
            setFuturesData(mockChineseFutures)
            setUsingMockData(true)
          } else {
            // Empty array or unexpected format
            console.warn('API returned empty or invalid data, using mock data')
            setError('No data available from API')
            setFuturesData(mockChineseFutures)
            setUsingMockData(true)
          }
        } else {
          // HTTP error status
          console.warn(`API returned status ${response.status}:`, data)
          setError(data.message || `Backend service unavailable (${response.status})`)
          setFuturesData(mockChineseFutures)
          setUsingMockData(true)
        }
      } catch (error) {
        console.error('Error fetching futures data:', error)
        setError('Failed to connect to API. Using mock data.')
        setFuturesData(mockChineseFutures)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredData = futuresData.filter(item => {
    const matchesExchange = selectedExchange === 'all' || item.exchange === selectedExchange
    const matchesSearch = searchTerm === '' || 
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.includes(searchTerm)
    return matchesExchange && matchesSearch
  })

  const exchanges = Array.from(new Set(futuresData.map(item => item.exchange)))

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">F</span>
              </div>
              <span className="text-xl font-bold">Futures</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
              <Link href="/cn" className="text-white font-semibold">Chinese Futures</Link>
              <a href="#" className="text-gray-400 hover:text-white transition">Trade</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Portfolio</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Sign In</button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition">Sign Up</button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            中国期货市场
          </h1>
          <p className="text-gray-400">Chinese Futures Market - Real-time data from major exchanges</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索合约代码或名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedExchange('all')}
              className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                selectedExchange === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              全部交易所
            </button>
            {exchanges.map(exchange => (
              <button
                key={exchange}
                onClick={() => setSelectedExchange(exchange)}
                className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
                  selectedExchange === exchange
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {exchange}
              </button>
            ))}
          </div>
        </div>

        {/* Error/Info Banner */}
        {error && (
          <div className="max-w-6xl mx-auto mb-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-yellow-400">{error}</span>
              </div>
              {usingMockData && (
                <span className="text-xs text-yellow-300">(Using mock data)</span>
              )}
            </div>
          </div>
        )}

        {/* Market Data Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Loading futures data...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">合约代码</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">合约名称</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">交易所</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">最新价</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">涨跌</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">涨跌幅</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">开盘价</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">最高价</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">最低价</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">成交量</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">持仓量</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-400">结算价</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                        未找到匹配的合约
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr
                        key={`${item.symbol}-${index}`}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">{item.symbol}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{item.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-400">{exchangeNames[item.exchange] || item.exchange}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-semibold">{item.latestPrice.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`font-semibold ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className={`font-semibold ${item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.open.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.high.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.low.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.volume.toLocaleString('zh-CN')}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.openInterest.toLocaleString('zh-CN')}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {item.settlement.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">数据来源说明</h2>
          <p className="text-gray-400 mb-4">
            本页面数据来源于 AKShare API，涵盖以下交易所的实时期货数据：
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-400 mb-2">上海期货交易所 (SHFE)</div>
              <div className="text-gray-400">螺纹钢、热轧卷板、沪铜、沪铝、沪锌等</div>
            </div>
            <div>
              <div className="font-semibold text-purple-400 mb-2">大连商品交易所 (DCE)</div>
              <div className="text-gray-400">玉米、豆粕、铁矿石、焦炭等</div>
            </div>
            <div>
              <div className="font-semibold text-green-400 mb-2">郑州商品交易所 (CZCE)</div>
              <div className="text-gray-400">棉花、PTA、白糖、菜籽油等</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-400 mb-2">中国金融期货交易所 (CFFEX)</div>
              <div className="text-gray-400">沪深300、中证500、上证50等</div>
            </div>
            <div>
              <div className="font-semibold text-pink-400 mb-2">上海国际能源交易中心 (INE)</div>
              <div className="text-gray-400">原油、20号胶等</div>
            </div>
            <div>
              <div className="font-semibold text-cyan-400 mb-2">广州期货交易所 (GFEX)</div>
              <div className="text-gray-400">工业硅等</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            API 文档: <a href="https://akshare.akfamily.xyz/data/futures/futures.html#id53" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">AKShare 期货数据</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">F</span>
              </div>
              <span className="font-semibold">Futures Trading Platform</span>
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Support</a>
              <a href="#" className="hover:text-white transition">API</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © 2024 Futures. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

