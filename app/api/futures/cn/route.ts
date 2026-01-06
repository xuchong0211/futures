import { NextResponse } from 'next/server'

/**
 * API Route for fetching Chinese futures data from AKShare
 * 
 * This endpoint should connect to a Python backend service that uses AKShare
 * to fetch real-time Chinese futures market data.
 * 
 * AKShare API Reference: https://akshare.akfamily.xyz/data/futures/futures.html#id53
 * 
 * Example AKShare functions:
 * - ak.futures_zh_spot() - 内盘-实时行情数据
 * - ak.futures_zh_spot_sina() - 内盘-实时行情数据(新浪)
 * - ak.futures_main_sina() - 主力连续合约
 */

export async function GET() {
  try {
    // Connect to Python backend with AKShare
    // Make sure the backend is running on http://localhost:8000
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    const response = await fetch(`${backendUrl}/api/futures/cn`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for production
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })

    if (!response.ok) {
      // If backend is not available, return mock data structure
      throw new Error('Backend service unavailable')
    }

    const data = await response.json()
    
    // Backend returns array directly, or object with data/success
    if (Array.isArray(data)) {
      return NextResponse.json(data)
    }
    
    // Handle object response
    if (data.success && Array.isArray(data.data)) {
      return NextResponse.json(data.data)
    }
    
    // If it's an error response, return it
    if (data.error) {
      return NextResponse.json(data, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    // If backend is not running, return error with instructions
    console.error('Error fetching Chinese futures data:', error)
    return NextResponse.json(
      { 
        error: 'Backend service unavailable',
        message: 'Please start the Python backend service (backend_example.py) to fetch real data from AKShare',
        documentation: 'https://akshare.akfamily.xyz/data/futures/futures.html#id53'
      },
      { status: 503 }
    )
  }
}

