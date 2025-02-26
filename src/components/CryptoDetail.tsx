import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, ArrowLeft } from 'lucide-react';
import { CryptoData } from '../types';
import axios from 'axios';

interface CryptoDetailProps {
  cryptoData: CryptoData[];
}

interface ExchangeData {
  exchange_id: string;
  name: string;
  trade_url: string;
  image: string;
  trust_score: number;
  volume_usd: number;
}

function CryptoDetail({ cryptoData }: CryptoDetailProps) {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState<ExchangeData[]>([]);
  const selectedCryptoData = cryptoData.find((crypto) => crypto.symbol === symbol);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${selectedCryptoData?.id}/tickers`
        );
        
        const processedExchanges = response.data.tickers
          .slice(0, 10)
          .map((ticker: any) => ({
            exchange_id: ticker.market.identifier,
            name: ticker.market.name,
            trade_url: ticker.trade_url,
            image: `https://www.coingecko.com/exchanges/${ticker.market.identifier}.png`,
            trust_score: ticker.trust_score || 0,
            volume_usd: ticker.converted_volume.usd
          }));
        
        setExchanges(processedExchanges);
      } catch (error) {
        console.error('Borsa verileri alınamadı:', error);
      }
    };

    if (selectedCryptoData) {
      fetchExchanges();
    }
  }, [selectedCryptoData]);

  if (!selectedCryptoData) {
    return <div>Kripto bulunamadı</div>;
  }

  const metadataItems = [
    {
      label: "Market Cap",
      value: `$${selectedCryptoData.market_cap.toLocaleString()}`,
    },
    {
      label: "24s Hacim",
      value: `$${selectedCryptoData.total_volume.toLocaleString()}`,
    },
    {
      label: "24s En Yüksek",
      value: `$${selectedCryptoData.high_24h.toLocaleString()}`,
    },
    {
      label: "24s En Düşük",
      value: `$${selectedCryptoData.low_24h.toLocaleString()}`,
    },
    {
      label: "Dolaşımdaki Arz",
      value: `${selectedCryptoData.circulating_supply.toLocaleString()} ${selectedCryptoData.symbol.toUpperCase()}`,
    },
    {
      label: "Toplam Arz",
      value: selectedCryptoData.total_supply 
        ? `${selectedCryptoData.total_supply.toLocaleString()} ${selectedCryptoData.symbol.toUpperCase()}`
        : "Sınırsız",
    },
  ];

  return (
    <div className="min-h-screen animated-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect text-white hover:bg-white/10 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={selectedCryptoData.image} alt={selectedCryptoData.name} className="w-16 h-16" />
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedCryptoData.name}</h2>
                <p className="text-gray-400">{selectedCryptoData.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">
                ${selectedCryptoData.current_price.toLocaleString()}
              </p>
              <div className={`flex items-center gap-1 ${
                selectedCryptoData.price_change_percentage_24h > 0 
                  ? 'text-green-400' 
                  : 'text-pink-500'
              }`}>
                {selectedCryptoData.price_change_percentage_24h > 0 ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
                <span className="text-lg">{Math.abs(selectedCryptoData.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-8">
            {metadataItems.map((item, index) => (
              <div key={index} className="glass-effect rounded-lg p-4">
                <p className="text-gray-400 text-sm">{item.label}</p>
                <p className="text-white text-lg font-semibold mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          
          <div className="h-96">
            <h3 className="text-white text-xl font-semibold mb-4">7 Günlük Fiyat Grafiği</h3>
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
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fiyat']}
                  labelFormatter={(label: number) => `${Math.floor(label / 24)} gün ${label % 24} saat önce`}
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

          {/* Market Performansı */}
          <div className="mt-8">
            <h3 className="text-white text-xl font-semibold mb-4">Market Performansı</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-effect rounded-lg p-4">
                <p className="text-gray-400">Market Cap Sıralaması</p>
                <p className="text-white text-2xl font-bold mt-1">#{selectedCryptoData.market_cap_rank}</p>
              </div>
              <div className="glass-effect rounded-lg p-4">
                <p className="text-gray-400">Market Hakimiyeti</p>
                <p className="text-white text-2xl font-bold mt-1">
                  {((selectedCryptoData.market_cap / cryptoData.reduce((acc, curr) => acc + curr.market_cap, 0)) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-white text-xl font-semibold mb-4">İşlem Gördüğü Borsalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exchanges.map((exchange) => (
                <a
                  key={exchange.exchange_id}
                  href={exchange.trade_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-effect rounded-lg p-4 hover:bg-white/[0.09] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={exchange.image} 
                      alt={exchange.name} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{exchange.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-400">
                          24s Hacim: ${exchange.volume_usd.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400">
                          Güven Puanı: {exchange.trust_score}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoDetail; 