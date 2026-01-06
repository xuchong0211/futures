"""
Python backend for fetching Chinese futures data using AKShare

This backend service uses AKShare to fetch real-time Chinese futures market data.

Installation:
    pip install akshare flask flask-cors pandas

Run:
    python backend_example.py

API Endpoint:
    GET http://localhost:8000/api/futures/cn
"""

import akshare as ak
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend


def map_akshare_data_to_interface(row, available_columns=None):
    """
    Map AKShare futures data to our frontend interface
    
    AKShare futures_zh_spot() typically returns columns like:
    - 合约代码, 最新价, 涨跌, 涨跌幅, 成交量, 持仓量, 开盘价, 最高价, 最低价, 结算价, etc.
    """
    try:
        # Convert pandas Series to dict for easier access
        if hasattr(row, 'to_dict'):
            row_dict = row.to_dict()
        elif isinstance(row, dict):
            row_dict = row
        else:
            row_dict = dict(row)
        
        # Debug: print first row's keys to understand structure
        if available_columns:
            print(f"Available columns: {available_columns}")
        
        # Helper function to get value from dict with multiple key options
        def get_value(*keys, default=''):
            for key in keys:
                # Try exact match first
                if key in row_dict:
                    val = row_dict[key]
                    if val is not None and val != '' and not pd.isna(val):
                        return val
                # Try case-insensitive match
                for dict_key in row_dict.keys():
                    if str(dict_key).lower() == str(key).lower():
                        val = row_dict[dict_key]
                        if val is not None and val != '' and not pd.isna(val):
                            return val
            return default
        
        # Get symbol - try many possible column names (AKShare typically uses these)
        symbol = str(get_value(
            '品种代码', '合约代码', 'symbol', '代码', 'code', 'contract', '合约', 
            'symbol_code', 'variety', '品种', 'variety_code', 'contract_code', default=''
        )).strip()
        
        # Get name - try many possible column names
        name = str(get_value(
            '品种名称', '合约名称', 'name', '名称', 'variety', '品种', 'contract_name',
            '品种名称', '商品名称', '商品', 'variety_name', 'variety_name_cn', default=''
        )).strip()
        
        # If symbol/name are still empty, try to get from index or first few columns
        # Skip date-like values and numeric indices
        if not symbol and len(row_dict) > 0:
            # Try to find a column that looks like a contract code (not a date, not purely numeric)
            for key, val in row_dict.items():
                key_str = str(key)
                val_str = str(val).strip()
                # Skip if it's a date format, purely numeric, or common price/volume fields
                if (key_str not in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] and
                    val_str and 
                    not val_str.startswith('20') and  # Skip dates like 2009-05-25
                    len(val_str) > 0 and
                    key_str not in ['最新价', '涨跌', '涨跌幅', '开盘价', '最高价', '最低价', '成交量', '持仓量', '结算价',
                                   'latest_price', 'change', 'change_percent', 'open', 'high', 'low', 'volume', 'open_interest', 'settlement']):
                    # Check if it looks like a contract code (has letters and numbers)
                    if any(c.isalpha() for c in val_str) and any(c.isdigit() for c in val_str):
                        symbol = val_str
                        break
        
        # If name is empty but we have symbol, use symbol as fallback
        if not name:
            name = symbol if symbol else '未知品种'
        
        # Determine exchange from symbol prefix or exchange column
        exchange = str(get_value('exchange', '交易所', 'exchange_code', '交易所代码', default='')).strip()
        if not exchange and symbol:
            # Try to infer from symbol
            symbol_upper = symbol.upper()
            if any(x in symbol_upper for x in ['IF', 'IC', 'IH', 'IM', 'TS', 'TF', 'T']):
                exchange = 'CFFEX'
            elif any(x in symbol_upper for x in ['SC', 'NR', 'LU', 'BC']):
                exchange = 'INE'
            elif any(x in symbol_upper for x in ['SI', 'LC']):
                exchange = 'GFEX'
            elif any(x in symbol_upper for x in ['RB', 'HC', 'CU', 'AL', 'ZN', 'PB', 'NI', 'SN', 'AU', 'AG', 'BU', 'RU', 'FU', 'SP', 'NR', 'SS']):
                exchange = 'SHFE'
            elif any(x in symbol_upper for x in ['C', 'CS', 'A', 'B', 'M', 'Y', 'P', 'L', 'V', 'PP', 'J', 'JM', 'I', 'JD', 'FB', 'BB', 'PG', 'LH', 'EB', 'EG', 'PK']):
                exchange = 'DCE'
            elif any(x in symbol_upper for x in ['CF', 'CY', 'SR', 'TA', 'OI', 'MA', 'FG', 'RS', 'RM', 'ZC', 'JR', 'LR', 'PM', 'WH', 'RI', 'SF', 'SM', 'UR', 'SA', 'PF', 'PK']):
                exchange = 'CZCE'
        
        # Extract numeric values with proper handling
        def safe_float(value, default=0.0):
            try:
                if value == '' or value == '-' or value is None:
                    return default
                if pd.isna(value):
                    return default
                # Remove commas and convert
                if isinstance(value, str):
                    value = value.replace(',', '').replace(' ', '').replace('，', '')
                return float(value)
            except:
                return default
        
        def safe_int(value, default=0):
            try:
                if value == '' or value == '-' or value is None:
                    return default
                if pd.isna(value):
                    return default
                if isinstance(value, str):
                    value = value.replace(',', '').replace(' ', '').replace('，', '')
                return int(float(value))
            except:
                return default
        
        # Map AKShare columns (try multiple possible column names)
        # AKShare futures_zh_spot_sina typically uses: 最新价, 涨跌, 涨跌幅, etc.
        latest_price = safe_float(
            get_value('最新价', 'latest_price', '现价', 'current_price', 'current', 'price', '最新'), 0
        )
        
        change = safe_float(
            get_value('涨跌', 'change', '涨跌额', 'change_amount', '涨跌额', '涨跌(元)'), 0
        )
        
        change_percent = safe_float(
            get_value('涨跌幅', 'change_percent', '涨跌%', 'pct_chg', 'change_pct', '涨跌幅(%)'), 0
        )
        
        volume = safe_int(
            get_value('成交量', 'volume', '成交', 'vol', '成交量手', '成交量(手)'), 0
        )
        
        open_interest = safe_int(
            get_value('持仓量', 'open_interest', '持仓', 'oi', '持仓手', '持仓量(手)'), 0
        )
        
        open_price = safe_float(
            get_value('开盘价', 'open', '今开', 'open_price', '开盘'), latest_price if latest_price > 0 else 0
        )
        
        high = safe_float(
            get_value('最高价', 'high', '最高', 'high_price', '最高'), latest_price if latest_price > 0 else 0
        )
        
        low = safe_float(
            get_value('最低价', 'low', '最低', 'low_price', '最低'), latest_price if latest_price > 0 else 0
        )
        
        settlement = safe_float(
            get_value('结算价', 'settlement', '昨结', '昨结算', 'pre_settlement', 'pre_settle', '昨结算'), 
            latest_price if latest_price > 0 else 0
        )
        
        return {
            'symbol': symbol,
            'name': name,
            'exchange': exchange,
            'latestPrice': latest_price,
            'change': change,
            'changePercent': change_percent,
            'volume': volume,
            'openInterest': open_interest,
            'open': open_price,
            'high': high,
            'low': low,
            'settlement': settlement,
            'tradingDate': datetime.now().strftime('%Y-%m-%d')
        }
    except Exception as e:
        print(f"Error mapping row: {e}")
        print(f"Row data keys: {list(row_dict.keys()) if 'row_dict' in locals() else 'N/A'}")
        print(f"Row data sample: {row.to_dict() if hasattr(row, 'to_dict') else str(row)[:200]}")
        return None


def fetch_futures_data():
    """
    Try multiple AKShare methods to fetch Chinese futures data
    Returns DataFrame or None if all methods fail
    """
    methods = [
        ('futures_zh_spot_sina', lambda: ak.futures_zh_spot_sina()),
        ('futures_zh_spot', lambda: ak.futures_zh_spot()),
        ('futures_main_sina', lambda: ak.futures_main_sina()),
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Trying {method_name}...")
            df = method_func()
            if df is not None and not df.empty:
                print(f"Successfully fetched data using {method_name}")
                print(f"Received {len(df)} rows, columns: {list(df.columns)}")
                return df, method_name
        except Exception as e:
            print(f"{method_name} failed: {str(e)}")
            continue
    
    return None, None


@app.route('/api/futures/cn', methods=['GET'])
def get_chinese_futures():
    """
    Fetch Chinese futures real-time market data using AKShare
    
    AKShare API Reference:
    https://akshare.akfamily.xyz/data/futures/futures.html#id53
    
    Tries multiple methods:
    - ak.futures_zh_spot_sina() - 内盘-实时行情数据(新浪)
    - ak.futures_zh_spot() - 内盘-实时行情数据
    - ak.futures_main_sina() - 主力连续合约
    """
    try:
        print("Fetching data from AKShare...")
        
        # Try multiple methods to fetch data
        df, method_used = fetch_futures_data()
        
        if df is None or df.empty:
            return jsonify({
                'success': False,
                'error': 'No data returned from AKShare',
                'message': 'All AKShare methods failed or returned empty dataset'
            }), 500
        
        # Reset index if it's a date index (common in AKShare)
        if df.index.name or (hasattr(df.index, 'dtype') and 'datetime' in str(df.index.dtype)):
            df = df.reset_index()
            print(f"Reset DataFrame index. New columns: {list(df.columns)}")
        
        # Transform the DataFrame to match our frontend interface
        futures_data = []
        
        # Print first row for debugging
        if len(df) > 0:
            print(f"\n=== DEBUG: First row sample ===")
            first_row = df.iloc[0]
            print(f"DataFrame shape: {df.shape}")
            print(f"Columns ({len(df.columns)}): {list(df.columns)}")
            print(f"Index name: {df.index.name}")
            print(f"First row as dict:")
            for col in df.columns[:10]:  # Print first 10 columns
                val = first_row[col]
                print(f"  '{col}': {val} (type: {type(val).__name__})")
            if len(df.columns) > 10:
                print(f"  ... and {len(df.columns) - 10} more columns")
            print(f"===============================\n")
        
        for index, row in df.iterrows():
            mapped_data = map_akshare_data_to_interface(row, available_columns=list(df.columns))
            if mapped_data:
                # Only add if we have at least a symbol or name
                if mapped_data.get('symbol') or mapped_data.get('name'):
                    futures_data.append(mapped_data)
                else:
                    if index < 3:  # Only print first few warnings
                        print(f"Warning: Skipped row {index} - no symbol or name found")
                        print(f"  Sample keys: {list(mapped_data.keys())[:5]}")
            else:
                if index < 3:  # Only print first few warnings
                    print(f"Warning: Failed to map row {index}")
        
        print(f"Mapped {len(futures_data)} futures contracts using {method_used}")
        
        return jsonify(futures_data)  # Return array directly for Next.js API route
    
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error fetching futures data: {error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': error_trace,
            'message': 'Failed to fetch futures data from AKShare'
        }), 500


@app.route('/api/futures/cn/exchanges', methods=['GET'])
def get_exchanges():
    """Get list of available Chinese futures exchanges"""
    exchanges = [
        {'code': 'SHFE', 'name': '上海期货交易所', 'url': 'https://www.shfe.com.cn'},
        {'code': 'DCE', 'name': '大连商品交易所', 'url': 'http://www.dce.com.cn'},
        {'code': 'CZCE', 'name': '郑州商品交易所', 'url': 'http://www.czce.com.cn'},
        {'code': 'CFFEX', 'name': '中国金融期货交易所', 'url': 'http://www.cffex.com.cn'},
        {'code': 'INE', 'name': '上海国际能源交易中心', 'url': 'https://www.ine.cn'},
        {'code': 'GFEX', 'name': '广州期货交易所', 'url': 'http://www.gfex.com.cn'},
    ]
    return jsonify({'exchanges': exchanges})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AKShare Futures API',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/futures/cn/test', methods=['GET'])
def test_akshare():
    """Test endpoint to check AKShare connection and data structure"""
    results = {}
    
    methods = [
        ('futures_zh_spot_sina', lambda: ak.futures_zh_spot_sina()),
        ('futures_zh_spot', lambda: ak.futures_zh_spot()),
        ('futures_main_sina', lambda: ak.futures_main_sina()),
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Testing {method_name}...")
            df = method_func()
            if df is not None and not df.empty:
                # Convert first row to dict with proper handling
                first_row = df.iloc[0]
                sample_dict = {}
                for col in df.columns:
                    try:
                        val = first_row[col]
                        # Convert to JSON-serializable format
                        if pd.isna(val):
                            sample_dict[str(col)] = None
                        else:
                            sample_dict[str(col)] = str(val)
                    except:
                        sample_dict[str(col)] = 'N/A'
                
                results[method_name] = {
                    'success': True,
                    'row_count': len(df),
                    'columns': [str(col) for col in df.columns],
                    'sample_row': sample_dict,
                    'first_3_rows': df.head(3).to_dict('records') if len(df) > 0 else None,
                }
            else:
                results[method_name] = {
                    'success': False,
                    'error': 'Empty DataFrame returned'
                }
        except Exception as e:
            results[method_name] = {
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            }
    
    # Check if any method succeeded
    successful_methods = [k for k, v in results.items() if v.get('success', False)]
    
    return jsonify({
        'overall_success': len(successful_methods) > 0,
        'successful_methods': successful_methods,
        'results': results
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Starting AKShare Futures API backend...")
    print("=" * 60)
    print("API Documentation: https://akshare.akfamily.xyz/data/futures/futures.html#id53")
    print("\nEndpoints:")
    print("  GET /api/futures/cn - Get Chinese futures market data")
    print("  GET /api/futures/cn/exchanges - Get list of exchanges")
    print("  GET /api/futures/cn/test - Test AKShare connection")
    print("  GET /health - Health check")
    print("\nStarting server on http://0.0.0.0:8000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8000, debug=True)
