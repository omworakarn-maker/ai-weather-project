import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, searchCities, reverseGeocode } from './services/weatherService';
import { getAIAnalysis, createWeatherChat } from './services/aiService';
import { WeatherData, AIAnalysis, CitySuggestion, ChatMessage, AIChatSession } from './types';
import { WEATHER_THEMES, DEFAULT_THEME } from './constants';
import WeatherMap from './components/WeatherMap';
import Navbar from './components/Navbar';
import {
  Search, MapPin, Wind, Droplets, Sun, BrainCircuit, RefreshCw,
  Loader2, Thermometer, MessageSquare, Send, X, TrendingUp, Crosshair, Cloud, ChevronDown, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiInsight, setAiInsight] = useState<AIAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSession, setChatSession] = useState<AIChatSession | null>(null);
  const [aiMode, setAiMode] = useState<'github' | 'gemini'>('gemini');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isMapFull, setIsMapFull] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentSearchRef = useRef<string>('');

  const currentTheme = weather ? (WEATHER_THEMES[weather.weatherCode] || DEFAULT_THEME) : DEFAULT_THEME;

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => updateWeatherData(pos.coords.latitude, pos.coords.longitude, 'ตำแหน่งปัจจุบัน'),
        (err) => {
          console.error(err);
          setError('ไม่สามารถระบุตำแหน่ง GPS ได้');
          setLoading(false);
        }
      );
    }
  };

  const updateWeatherData = useCallback(async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon, name);
      setWeather(data);
      setLoading(false);

      // Reset Chat with new session using current mode
      const newChat = createWeatherChat(data, aiMode);
      setChatSession(newChat);
      setChatMessages([
        {
          role: 'model', text: aiMode === 'github'
            ? `สวัสดีค่ะ! น้องฟ้าใสพร้อมแนะนำคุณแล้วค่ะ วันนี้ที่ ${name} อากาศเป็นยังไงบ้างคะ? ✨`
            : `หวัดดีครับ! น้องพายุพร้อมลุยกับคุณที่ ${name} แล้ว มีอะไรถามมาได้เลย! ⚡`
        }
      ]);

      setAiLoading(true);
      const analysis = await getAIAnalysis(data);
      setAiInsight(analysis);
      setAiLoading(false);
    } catch (err) {
      setError('ไม่สามารถดึงข้อมูลได้ โปรดลองอีกครั้ง');
      setLoading(false);
      setAiLoading(false);
    }
  }, [aiMode]);

  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateWeatherData(pos.coords.latitude, pos.coords.longitude, 'ตำแหน่งปัจจุบัน'),
        () => updateWeatherData(13.7563, 100.5018, 'กรุงเทพมหานคร')
      );
    } else {
      updateWeatherData(13.7563, 100.5018, 'กรุงเทพมหานคร');
    }
  }, [updateWeatherData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Debugging Gemini Chat Messages
    console.log("Chat Messages:", chatMessages);
  }, [chatMessages]);

  // Sync chat session when mode changes
  useEffect(() => {
    if (weather) {
      const newChat = createWeatherChat(weather, aiMode);
      setChatSession(newChat);
    }
  }, [aiMode, weather]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    currentSearchRef.current = val;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.length < 2) { setSuggestions([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(val);
        if (currentSearchRef.current === val) setSuggestions(Array.isArray(results) ? results : []);
      } catch (err) { setSuggestions([]); }
    }, 500);
  };

  const handleSelectCity = (city: CitySuggestion) => {
    updateWeatherData(city.latitude, city.longitude, city.name);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading || !chatSession || !weather) return;

    if (chatInput.trim() === '/clear') {
      setChatMessages([]);
      setChatInput('');
      setChatSession(createWeatherChat(weather, aiMode));
      return;
    }

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const result = await chatSession.sendMessage(userMsg);
      const text = result.response.text();
      setChatMessages(prev => [...prev, { role: 'model', text: text }].slice(-10));
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: 'ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-80px)] bg-gradient-to-br ${currentTheme.bg} transition-all duration-1000 p-4 md:p-8 flex flex-col items-center ${currentTheme.text} overflow-x-hidden`}>
      {/* Search Header */}
      <header className="w-full max-w-2xl mb-8 relative z-40 flex items-center gap-4">
        <div className="flex-1 flex items-center glass rounded-full px-6 py-3 shadow-lg transition-all focus-within:ring-2 focus-within:ring-white/50">
          <Search className="opacity-60 mr-3" size={20} />
          <input
            type="text"
            className="bg-transparent border-none outline-none w-full placeholder:text-current placeholder:opacity-40 text-lg"
            placeholder="ค้นหาเมือง..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {loading && <RefreshCw className="animate-spin opacity-60" size={20} />}
        </div>
        <button onClick={handleUseCurrentLocation} className="glass p-3 rounded-full hover:bg-white/20 transition-colors">
          <Crosshair size={24} className="opacity-80" />
        </button>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/10">
            {suggestions.map((city, idx) => (
              <button key={idx} onClick={() => handleSelectCity(city)} className="w-full text-left px-6 py-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-none flex justify-between items-center text-white">
                <div className="flex flex-col">
                  <span className="font-bold">{city.name}</span>
                  <span className="text-xs opacity-60">{city.admin1}</span>
                </div>
                <MapPin size={16} className="opacity-60" />
              </button>
            ))}
          </div>
        )}
      </header>

      {error && <div className="bg-red-500/20 text-red-900 px-6 py-3 rounded-xl mb-6 backdrop-blur">{error}</div>}

      {loading && !weather ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-xl font-medium">กำลังเตรียมข้อมูลสภาพอากาศ...</p>
        </div>
      ) : weather && (
        <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {/* Main Card */}
          <div className="lg:col-span-2 bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between border border-white/20">
            <div className="flex justify-between items-start">
              <div className={currentTheme.text}>
                <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                  <MapPin className="opacity-60" /> {weather.city}
                </h1>
                <p className="text-lg font-medium opacity-40 mt-2">
                  {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className={`text-7xl md:text-8xl font-bold ${currentTheme.text}`}>{Math.round(weather.temperature)}°C</div>
            </div>

            <div className="mt-8 flex items-center gap-8">
              <div className="relative">
                <span className="text-7xl md:text-9xl drop-shadow-2xl animate-pulse">{currentTheme.icon}</span>
              </div>
              <div className={currentTheme.text}>
                <h2 className="text-3xl md:text-4xl font-bold opacity-80">{weather.conditionText}</h2>
                <p className="text-lg opacity-40 font-medium">รู้สึกเหมือน {Math.round(weather.temperature - 1)}°C</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 w-full">
              {[
                { label: 'ลม', val: `${weather.windSpeed} กม./ชม`, icon: <Wind size={28} /> },
                { label: 'ความชื้น', val: `${weather.humidity}%`, icon: <Droplets size={28} /> },
                { label: 'ฝน', val: `${weather.rainChance}%`, icon: <Cloud size={28} /> },
                { label: 'UV', val: weather.uvIndex, icon: <Sun size={28} /> }
              ].map((item, i) => (
                <div key={i} className="bg-white/30 backdrop-blur-md p-6 rounded-[2rem] flex flex-col items-center text-center shadow-sm border border-white/10 transition-transform hover:scale-105">
                  <div className={`mb-2 opacity-70 ${currentTheme.text}`}>{item.icon}</div>
                  <span className={`text-[11px] uppercase tracking-wider opacity-40 mb-1 font-bold ${currentTheme.text}`}>{item.label}</span>
                  <span className={`text-xl font-bold ${currentTheme.text}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20 relative overflow-hidden flex flex-col">
            <div className={`flex items-center gap-2 mb-6 ${currentTheme.text}`}>
              <BrainCircuit className="opacity-70" size={28} />
              <h3 className="text-2xl font-bold opacity-90">AI วิเคราะห์อัจฉริยะ</h3>
            </div>

            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-20 flex-1">
                <RefreshCw className={`animate-spin mb-4 opacity-40 ${currentTheme.text}`} size={32} />
                <p className={`text-center italic font-semibold opacity-40 ${currentTheme.text}`}>กำลังวิเคราะห์ข้อมูล...</p>
              </div>
            ) : aiInsight && (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-500 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <div className={currentTheme.text}>
                  <h4 className="text-[11px] uppercase tracking-wider font-bold opacity-30 mb-2">ภาพรวม</h4>
                  <p className="text-sm leading-relaxed font-medium opacity-80">{aiInsight.summary}</p>
                </div>
                {[
                  { label: '👕 การแต่งกาย', text: aiInsight.clothingAdvice },
                  { label: '🏥 สุขภาพ', text: aiInsight.healthAdvice },
                  { label: '🎯 กิจกรรม', text: aiInsight.activityRecommendation }
                ].map((item, i) => (
                  <div key={i} className={`bg-white/10 p-4 rounded-[1.5rem] border border-white/5 ${currentTheme.text}`}>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-2 opacity-80">{item.label}</h4>
                    <p className="text-xs font-semibold leading-relaxed opacity-60">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsChatOpen(true)}
              className="mt-8 bg-purple-600 hover:bg-purple-500 text-white transition-all p-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-purple-900/20 transform active:scale-95"
            >
              <MessageSquare size={22} /> คุยกับ AI ฟ้าใส/พายุ
            </button>
          </div>

          {/* Map */}
          <div className={`${isMapFull ? 'fixed top-20 md:top-24 inset-x-0 bottom-0 z-[40] w-full' : 'lg:col-span-3 transition-all duration-500 relative min-h-[450px]'}`}>
            <div className={`transition-all duration-500 overflow-hidden flex flex-col w-full h-full ${isMapFull ? 'rounded-none p-0 bg-slate-950 relative' : 'bg-white/30 backdrop-blur-3xl shadow-2xl border border-white/40 min-h-[450px] rounded-[3.5rem] p-6'}`}>
              <div className={`flex items-center justify-between mb-6 shrink-0 px-6 transition-all ${isMapFull ? 'absolute top-8 left-0 right-0 z-50 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4 pointer-events-auto">
                  <div className={`p-2.5 rounded-2xl ${isMapFull ? 'bg-white/10' : 'bg-blue-500/10'}`}>
                    <MapPin size={26} className={isMapFull ? 'text-white' : 'text-blue-500'} />
                  </div>
                  <h3 className={`text-2xl font-bold ${isMapFull ? 'text-white' : 'text-blue-600'}`}>แผนที่ตำแหน่ง</h3>
                </div>
                {isMapFull && (
                  <button
                    onClick={() => setIsMapFull(false)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95 border border-white/20 pointer-events-auto"
                  >
                    <X size={28} />
                  </button>
                )}
              </div>
              <div className={`overflow-hidden ${isMapFull ? 'absolute inset-0 z-0 rounded-none' : 'relative flex-1 min-h-0 rounded-[2.5rem] md:rounded-[3rem] shadow-inner'}`}>
                <WeatherMap
                  key={isMapFull ? 'full' : 'small'}
                  lat={weather.latitude} lon={weather.longitude} locationName={weather.city} isFullScreen={isMapFull}
                  onToggleFullScreen={() => setIsMapFull(!isMapFull)}
                  onLocationSelect={async (lat, lon) => {
                    const cityName = await reverseGeocode(lat, lon);
                    updateWeatherData(lat, lon, cityName);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Forecast Section */}
          <div className="lg:col-span-3 mt-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <Thermometer className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-blue-600 tracking-tight">พยากรณ์อากาศ 7 วัน</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weather.forecast.map((day, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center border border-white/20 shadow-sm transition-all text-center"
                  >
                    <span className={`text-[11px] font-bold opacity-40 mb-2 uppercase tracking-wider ${currentTheme.text}`}>
                      {idx === 0 ? 'วันนี้' : new Date(day.date).toLocaleDateString('th-TH', { weekday: 'short' })}
                    </span>
                    <div className="text-4xl my-2">
                      {WEATHER_THEMES[day.weatherCode]?.icon || '🌡️'}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-xl font-bold ${currentTheme.text}`}>{Math.round(day.maxTemp)}°</span>
                      <span className={`text-xs opacity-40 ${currentTheme.text}`}>{Math.round(day.minTemp)}°</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-blue-500 font-bold justify-center">
                      <Droplets size={10} /> {day.rainChance}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Floating Chat Interface */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[6px] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
          <div className="bg-white/20 backdrop-blur-2xl w-full max-w-xl h-[90vh] md:h-[700px] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/30 text-white animate-in slide-in-from-bottom-20 duration-500 glassmorphism-chat">

            {/* Chat Header */}
            <div className={`flex items-center justify-between p-5 border-b border-white/10 transition-colors duration-500 ${aiMode === 'github' ? 'bg-purple-600/10' : 'bg-blue-600/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${aiMode === 'github' ? 'bg-gradient-to-tr from-purple-500 to-pink-500 rotate-3' : 'bg-gradient-to-tr from-blue-500 to-cyan-400 -rotate-3'
                  }`}>
                  {aiMode === 'github' ? <BrainCircuit className="text-white" size={24} /> : <Zap className="text-white" size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">
                    {aiMode === 'github' ? 'น้องฟ้าใส (GPT-4)' : 'น้องพายุ (Gemini)'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Online Assistant</p>
                  </div>
                </div>
              </div>

              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => { if (aiMode !== 'github') { setAiMode('github'); setChatMessages([]); } }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 ${aiMode === 'github' ? 'bg-purple-500 shadow-lg text-white scale-105' : 'text-white/30 hover:text-white/60'}`}
                >ฟ้าใส</button>
                <button
                  onClick={() => { if (aiMode !== 'gemini') { setAiMode('gemini'); setChatMessages([]); } }}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 ${aiMode === 'gemini' ? 'bg-blue-500 shadow-lg text-white scale-105' : 'text-white/30 hover:text-white/60'}`}
                >พายุ</button>
              </div>

              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2">
                <X className="size-6 text-white/50" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageSquare size={40} />
                  </div>
                  <p className="text-sm">เริ่มคุยกับ{aiMode === 'github' ? 'น้องฟ้าใส' : 'น้องพายุ'}ได้เลยค่ะ!</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}> 
                    {msg.role === 'model' && (
                      <div className={`size-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 ${aiMode === 'github' ? 'bg-purple-400/30' : 'bg-blue-400/30'} shadow-md border border-white/20`}>
                        {aiMode === 'github' ? <BrainCircuit size={14} className="text-purple-200" /> : <Zap size={14} className="text-blue-200" />}
                      </div>
                    )}
                    <div className={`p-4 rounded-[1.5rem] text-sm md:text-base leading-relaxed shadow-xl border ${msg.role === 'user'
                      ? 'bg-white/30 text-purple-900 rounded-tr-none border-white/30 backdrop-blur-md'
                      : 'bg-white/20 border-white/20 text-blue-900 rounded-tl-none backdrop-blur-md'
                      }`} style={{backdropFilter:'blur(12px)'}}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-2 items-center">
                    <div className="size-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="size-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="size-2 bg-white/40 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white/[0.02] border-t border-white/10">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={aiMode === 'github' ? 'คุยกับน้องฟ้าใส... ✨' : 'ทักทายน้องพายุ... ⚡'}
                  className="flex-1 bg-white/5 text-white rounded-[1.2rem] py-4 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all placeholder:text-white/20 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`p-4 rounded-2xl text-white shadow-xl transition-all active:scale-90 flex items-center justify-center ${aiMode === 'github' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                >
                  <Send className="size-5" />
                </button>
              </div>
              <p className="text-[9px] text-center mt-4 opacity-20 uppercase tracking-[0.2em]">test</p>
            </form>
          </div>
        </div>
      )}

      {!isChatOpen && weather && (
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <MessageSquare size={28} />
        </button>
      )}

      <footer className="mt-auto py-8 text-center opacity-30 text-xs text-current">
        <p>© 2024 AI Weather Insights - ข้อมูลโดย Open-Meteo</p>
      </footer>
    </div>
  );
};

export default App;
