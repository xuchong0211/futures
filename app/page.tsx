'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: string
  high24h: number
  low24h: number
}

const mockMarketData: MarketData[] = [
  { symbol: 'BTC/USDT', price: 43250.50, change: 1250.30, changePercent: 2.98, volume: '2.5B', high24h: 43800.00, low24h: 41900.00 },
  { symbol: 'ETH/USDT', price: 2650.75, change: -45.20, changePercent: -1.68, volume: '1.8B', high24h: 2720.00, low24h: 2620.00 },
  { symbol: 'SOL/USDT', price: 98.45, change: 3.20, changePercent: 3.36, volume: '850M', high24h: 101.20, low24h: 94.50 },
  { symbol: 'BNB/USDT', price: 315.80, change: 8.50, changePercent: 2.76, volume: '420M', high24h: 320.00, low24h: 305.00 },
  { symbol: 'XRP/USDT', price: 0.625, change: 0.015, changePercent: 2.46, volume: '680M', high24h: 0.635, low24h: 0.610 },
]

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<'perpetual' | 'futures'>('perpetual')

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">F</span>
              </div>
              <span className="text-xl font-bold">Futures</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">Markets</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Trade</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Portfolio</a>
              <a href="#" className="text-gray-400 hover:text-white transition">History</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Sign In</button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition">Sign Up</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Professional Futures Trading
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Trade futures contracts with up to 125x leverage. Advanced tools for professional traders.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition">
              Start Trading
            </button>
            <Link 
              href="/cn"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition inline-block"
            >
              View Markets
            </Link>
          </div>
        </div>

        {/* Trading Tabs */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedTab('perpetual')}
              className={`px-6 py-2 rounded-md transition ${
                selectedTab === 'perpetual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Perpetual Futures
            </button>
            <button
              onClick={() => setSelectedTab('futures')}
              className={`px-6 py-2 rounded-md transition ${
                selectedTab === 'futures'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarterly Futures
            </button>
          </div>
        </div>

        {/* Market Data Table */}
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Symbol</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Last Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">24h Change</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">24h High</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">24h Low</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">24h Volume</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockMarketData.map((market, index) => (
                  <tr
                    key={market.symbol}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{market.symbol}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold">${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${market.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      ${market.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      ${market.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">{market.volume}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition">
                        Trade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">High Leverage</h3>
            <p className="text-gray-400">Trade with up to 125x leverage on perpetual futures contracts</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Charts</h3>
            <p className="text-gray-400">Professional trading charts with technical indicators and drawing tools</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
            <p className="text-gray-400">Enterprise-grade security with cold storage and insurance fund</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto mt-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-8 border border-gray-700">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">$2.5T+</div>
              <div className="text-gray-400">24h Trading Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Trading Pairs</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">10M+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
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
