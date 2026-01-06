export const WEATHER_THEMES: Record<number, { bg: string; text: string; icon: string }> = {
  0: { bg: 'from-blue-400 to-blue-200', text: 'text-blue-900', icon: '☀️' },
  1: { bg: 'from-blue-300 to-blue-100', text: 'text-blue-800', icon: '🌤️' },
  2: { bg: 'from-blue-200 to-gray-200', text: 'text-gray-800', icon: '⛅' },
  3: { bg: 'from-gray-300 to-gray-400', text: 'text-gray-900', icon: '☁️' },
  45: { bg: 'from-gray-400 to-gray-500', text: 'text-white', icon: '🌫️' },
  48: { bg: 'from-gray-400 to-gray-500', text: 'text-white', icon: '🌫️' },
  51: { bg: 'from-indigo-200 to-blue-300', text: 'text-indigo-900', icon: '🌦️' },
  61: { bg: 'from-indigo-300 to-indigo-500', text: 'text-white', icon: '🌧️' },
  71: { bg: 'from-blue-50 to-white', text: 'text-blue-900', icon: '❄️' },
  80: { bg: 'from-indigo-500 to-blue-700', text: 'text-white', icon: '🌧️' },
  95: { bg: 'from-purple-700 to-indigo-900', text: 'text-white', icon: '⛈️' },
};

export const DEFAULT_THEME = {
  bg: 'from-blue-400 to-blue-200',
  text: 'text-blue-900',
  icon: '🌡️',
};


export const WEATHER_CODE_TO_TEXT: Record<number, string> = {
  0: 'ท้องฟ้าแจ่มใส',
  1: 'ท้องฟ้าโปร่ง',
  2: 'มีเมฆบางส่วน',
  3: 'เมฆครึ้ม',
  45: 'มีหมอก',
  48: 'มีหมอกลงจัด',
  51: 'ฝนปรอยๆ',
  61: 'ฝนตกเล็กน้อย',
  63: 'ฝนตกปานกลาง',
  65: 'ฝนตกหนัก',
  71: 'หิมะตกเล็กน้อย',
  80: 'ฝนซู่',
  95: 'พายุฝนฟ้าคะนอง',
};
