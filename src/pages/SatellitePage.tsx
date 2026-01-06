import React, { useState, useEffect } from 'react';
import { getAvailableDates, getImagesForDate, getImageUrl, EpicImage } from '../services/satelliteService';
import { Loader2, Calendar, ChevronLeft, ChevronRight, Globe, Info, Download } from 'lucide-react';

const SatellitePage: React.FC = () => {
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [images, setImages] = useState<EpicImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const availableDates = await getAvailableDates();
            if (availableDates.length > 0) {
                setDates(availableDates);
                // Select the most recent date
                const latest = availableDates[0];
                setSelectedDate(latest);
                loadImages(latest);
            }
        };
        init();
    }, []);

    const loadImages = async (date: string) => {
        setLoading(true);
        const data = await getImagesForDate(date);
        setImages(data);
        setCurrentIndex(0);
        setLoading(false);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        loadImages(date);
    };

    const currentImage = images[currentIndex];
    const imageUrl = currentImage ? getImageUrl(currentImage.image, selectedDate) : '';

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
                            <Globe className="text-blue-500" />
                            ภาพถ่ายดาวเทียม EPIC
                        </h1>
                        <p className="text-slate-400 mt-2 flex items-center gap-2">
                            <Info size={16} /> มุมมองโลกเรียลไทม์จากดาวเทียม DSCOVR ของ NASA
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                        <Calendar size={20} className="text-blue-400 ml-2" />
                        <select
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="bg-transparent border-none outline-none text-sm font-bold pr-4 cursor-pointer"
                        >
                            {dates.map(d => (
                                <option key={d} value={d} className="bg-slate-900">{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Image Viewer */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/5 group">
                            {loading || !imageUrl ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                                    <p className="opacity-50">กำลังรับสัญญาณภาพจากดาวเทียม...</p>
                                </div>
                            ) : (
                                <>
                                    {imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                                            <Loader2 className="animate-spin text-blue-500" size={32} />
                                        </div>
                                    )}
                                    <img
                                        src={imageUrl}
                                        alt={currentImage?.caption}
                                        className={`w-full h-full object-contain transition-opacity duration-700 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                        onLoad={() => setImageLoading(false)}
                                    />

                                    {/* Navigation Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1)); setImageLoading(true); }}
                                            className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all active:scale-90"
                                        >
                                            <ChevronLeft size={32} />
                                        </button>
                                        <button
                                            onClick={() => { setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0)); setImageLoading(true); }}
                                            className="p-4 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full border border-white/10 transition-all active:scale-90"
                                        >
                                            <ChevronRight size={32} />
                                        </button>
                                    </div>

                                    {/* Info Overlay */}
                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex justify-between items-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <div>
                                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">DSCOVR EPIC CAMERA</p>
                                            <p className="text-[10px] text-white/60">ตำแหน่ง: {currentImage?.centroid_coordinates.lat.toFixed(2)}, {currentImage?.centroid_coordinates.lon.toFixed(2)}</p>
                                        </div>
                                        <a href={imageUrl} download target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <Download size={20} />
                                        </a>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnails / Slider Controls */}
                        <div className="flex items-center justify-center gap-4 py-2">
                            <div className="flex gap-1">
                                {images.map((_, i) => (
                                    <div key={i} className={`h-1 mx-0.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`} />
                                ))}
                            </div>
                            <span className="text-xs font-mono opacity-50">{currentIndex + 1} / {images.length}</span>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md h-fit">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Info className="text-blue-400" size={18} /> รายละเอียดภาพ
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider opacity-40">รหัสภาพ</label>
                                    <p className="font-mono text-sm">{currentImage?.identifier}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider opacity-40">วันเวลาที่บันทึก</label>
                                    <p className="font-bold">{currentImage?.date}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider opacity-40">คำอธิบาย</label>
                                    <p className="text-xs leading-relaxed opacity-80">{currentImage?.caption}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-6 border border-blue-500/20 backdrop-blur-md text-center">
                            <h4 className="font-bold text-sm mb-2">DSCOVR Mission</h4>
                            <p className="text-[10px] opacity-70 leading-relaxed">
                                ดาวเทียม DSCOVR จะส่งภาพสีของโลกทั้งใบวันละอย่างน้อย 1 ครั้ง เพื่อศึกษาบรรยากาศของโลกและพยากรณ์พายุสุริยะ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SatellitePage;
