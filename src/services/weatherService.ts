
import { WeatherData, CitySuggestion, ForecastDay, HourlyPoint } from '../types';
import { WEATHER_CODE_TO_TEXT } from '../constants';

export const fetchWeather = async (lat: number, lon: number, cityName: string): Promise<WeatherData> => {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,precipitation',
      hourly: 'temperature_2m,weather_code,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '7'
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

    if (!res.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await res.json();
    const current = data.current;

    // Process Hourly Data (next 24 hours)
    const hourly: HourlyPoint[] = data.hourly.time
      .slice(0, 24)
      .map((time: string, index: number) => ({
        time: new Date(time).toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit' }),
        temp: Math.round(data.hourly.temperature_2m[index]),
        rainChance: data.hourly.precipitation_probability[index]
      }));

    // Process Daily Forecast
    const forecast: ForecastDay[] = data.daily.time.map((time: string, index: number) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      condition: WEATHER_CODE_TO_TEXT[data.daily.weather_code[index]] || 'ไม่ทราบ',
      weatherCode: data.daily.weather_code[index],
      rainChance: data.daily.precipitation_probability_max[index]
    }));

    return {
      city: cityName,
      latitude: lat,
      longitude: lon,
      temperature: current.temperature_2m,
      conditionText: WEATHER_CODE_TO_TEXT[current.weather_code] || 'ไม่ทราบ',
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      uvIndex: data.daily.uv_index_max?.[0] ?? 0,
      weatherCode: current.weather_code,
      rainChance: data.daily.precipitation_probability_max?.[0] ?? 0,
      hourly,
      forecast
    };

  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error('ไม่สามารถดึงข้อมูลสภาพอากาศได้');
  }
};

export const searchCities = async (query: string): Promise<CitySuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    // ลด limit เหลือ 5 และระบุความต้องการให้ชัดเจนขึ้น
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=th`);
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    const results: CitySuggestion[] = [];
    const seen = new Set();

    data.forEach((item: any) => {
      const name = item.address?.suburb || item.address?.village || item.address?.town || item.address?.city || item.display_name.split(',')[0];

      // กรองเอาเฉพาะข้อมูลที่มีความหมายและไม่ซ้ำกันในบรรทัดเดียว
      const detailsArray = Array.from(new Set([
        item.address?.district,
        item.address?.city || item.address?.town,
        item.address?.province || item.address?.state
      ].filter(Boolean))).filter(d => d !== name); // ตัดชื่อที่ซ้ำกับหัวข้อออก

      const admin1 = detailsArray.join(', ');

      // ป้องกันผลลัพธ์ซ้ำซ้อน
      const key = `${name}-${admin1}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          name: name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: item.address?.country || '',
          admin1: admin1
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: {
        'Accept-Language': 'th,en'
      }
    });
    const data = await res.json();

    // Attempt to get the most specific name (city, town, or village)
    return data.address?.city || data.address?.town || data.address?.village || data.address?.province || data.address?.state || 'ตำแหน่งที่เลือก';
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return 'ตำแหน่งที่เลือก';
  }
};