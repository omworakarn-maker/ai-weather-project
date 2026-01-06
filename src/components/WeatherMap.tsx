import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus, Maximize2, Minimize2, Move, X } from 'lucide-react';

// Fix Icon Image issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherMapProps {
    lat: number;
    lon: number;
    locationName: string;
    onLocationSelect?: (lat: number, lon: number) => void;
    isFullScreen?: boolean;
    onToggleFullScreen?: () => void;
}

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom(), { duration: 0.8 });
    }, [center, map]);
    return null;
}

const MapEvents = ({ onSelect, isFullScreen }: { onSelect?: (lat: number, lon: number) => void, isFullScreen?: boolean }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            if (onSelect) {
                onSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    useEffect(() => {
        if (map) {
            // Multiple attempts to invalidate size to ensure it catches the layout finish
            const timer1 = setTimeout(() => map.invalidateSize(), 100);
            const timer2 = setTimeout(() => map.invalidateSize(), 500);
            const timer3 = setTimeout(() => map.invalidateSize(), 1000);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
            };
        }
    }, [map, isFullScreen]);

    return null;
}

const ZoomButton = ({ type }: { type: 'in' | 'out' }) => {
    const map = useMap();
    const isIn = type === 'in';

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                isIn ? map.zoomIn() : map.zoomOut();
            }}
            className="text-white p-3 rounded-xl transition-all hover:bg-white/10 active:scale-90 flex items-center justify-center"
            title={isIn ? "ขยาย" : "ลด"}
        >
            {isIn ? <Plus size={20} strokeWidth={2.5} /> : <Minus size={20} strokeWidth={2.5} />}
        </button>
    );
}

const CustomControls: React.FC<{
    isFullScreen?: boolean;
    onToggleFullScreen?: () => void;
}> = ({ isFullScreen, onToggleFullScreen }) => {
    const controlRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (controlRef.current) {
            L.DomEvent.disableClickPropagation(controlRef.current);
            L.DomEvent.disableScrollPropagation(controlRef.current);
        }
    }, [controlRef]);

    return (
        <div
            ref={controlRef}
            className={`absolute top-6 right-6 z-[1000] flex flex-col gap-3 transition-all duration-500 ${isFullScreen ? 'scale-110 translate-x-[-10px] translate-y-[10px]' : ''}`}
        >
            {onToggleFullScreen && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFullScreen();
                    }}
                    className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white p-3.5 rounded-2xl transition-all hover:bg-white/20 hover:scale-105 active:scale-90 shadow-2xl flex items-center justify-center group/btn"
                    title={isFullScreen ? "ลดขนาด" : "ขยายเต็มจอ"}
                >
                    {isFullScreen ?
                        <Minimize2 size={22} className="group-hover/btn:rotate-180 transition-transform duration-500" /> :
                        <Maximize2 size={22} className="group-hover/btn:scale-110 transition-transform" />
                    }
                </button>
            )}

            <div className="flex flex-col gap-1 bg-white/10 backdrop-blur-2xl border border-white/20 p-1.5 rounded-2xl shadow-2xl">
                <ZoomButton type="in" />
                <div className="h-[1px] bg-white/10 mx-2" />
                <ZoomButton type="out" />
            </div>
        </div>
    );
};

const WeatherMap: React.FC<WeatherMapProps> = ({
    lat,
    lon,
    locationName,
    onLocationSelect,
    isFullScreen,
    onToggleFullScreen
}) => {
    return (
        <div className={`h-full w-full relative group transition-all duration-700 ease-out ${isFullScreen ? 'bg-slate-900' : 'bg-transparent'}`}>
            <MapContainer
                center={[lat, lon]}
                zoom={12}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ height: "100%", width: "100%", background: '#0f172a' }}
                className="z-0"
            >
                <ChangeView center={[lat, lon]} />
                <MapEvents onSelect={onLocationSelect} isFullScreen={isFullScreen} />

                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />

                <Marker position={[lat, lon]}>
                    <Popup className="custom-popup">
                        <div className="font-bold text-slate-900 p-1">{locationName}</div>
                    </Popup>
                </Marker>

                <CustomControls isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} />
            </MapContainer>

            {/* Premium Info Badge */}
            <div className={`absolute bottom-6 left-6 z-[1000] bg-slate-900/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-none transition-all duration-500 ${isFullScreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400">
                    <Move size={16} />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold opacity-80 leading-none mb-1">Interactive Map</div>
                    <span className="text-xs text-white/90 font-medium">คลิกเลือกเมือง • เลื่อนเพื่อซูม</span>
                </div>
            </div>

            {/* Subtle Gradient Overlay Removed */}
        </div>
    );
};

export default WeatherMap;
