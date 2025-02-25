import React, { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { CryptoData } from './types';

function App() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'price_change_percentage_24h_desc',
              per_page: 11,
              page: 1,
              sparkline: true,
            },
          }
        );
        setCryptoData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const selectedCryptoData = cryptoData.find((crypto) => crypto.symbol === selectedCrypto);
  const otherCryptos = cryptoData.filter((crypto) => crypto.symbol !== selectedCrypto);

  return (
    <div className="min-h-screen animated-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Crypto Dashboard</h1>
          {selectedCrypto !== 'btc' && (
            <button
              onClick={() => setSelectedCrypto('btc')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect text-white hover:bg-white/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bitcoin
            </button>
          )}
        </div>
        
        {selectedCryptoData && (
          <div className="glass-card rounded-2xl p-8 shadow-2xl mb-8 transition-all duration-300 hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={selectedCryptoData.image} alt={selectedCryptoData.name} className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCryptoData.name}</h2>
                  <p className="text-gray-400">{selectedCryptoData.symbol.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  ${selectedCryptoData.current_price.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 ${
                  selectedCryptoData.price_change_percentage_24h > 0 
                    ? 'text-green-400' 
                    : 'text-pink-500'
                }`}>
                  {selectedCryptoData.price_change_percentage_24h > 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(selectedCryptoData.price_change_percentage_24h).toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div className="h-48 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedCryptoData.sparkline_in_7d.price.map((price, index) => ({
                  value: price,
                  time: index
                }))}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(139, 92, 246, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {otherCryptos.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className="glass-card rounded-xl p-6 hover:bg-white/[0.09] transition-all duration-300 text-left w-full group"
            >
              <div className="flex items-center gap-3">
                <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                <div>
                  <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">{crypto.symbol.toUpperCase()}</h3>
                  <div className={`flex items-center gap-1 text-sm ${
                    crypto.price_change_percentage_24h > 0 
                      ? 'text-green-400' 
                      : 'text-pink-500'
                  }`}>
                    {crypto.price_change_percentage_24h > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <p className="text-lg font-semibold text-white mt-2 group-hover:text-purple-400 transition-colors">
                ${crypto.current_price.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;