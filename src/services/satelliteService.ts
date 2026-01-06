export interface EpicImage {
    identifier: string;
    caption: string;
    image: string;
    version: string;
    date: string; // ISO string 2023-01-01 00:00:00
    centroid_coordinates: {
        lat: number;
        lon: number;
    };
}

const BASE_URL = 'https://epic.gsfc.nasa.gov';

export const getAvailableDates = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/natural/available`);
        if (!response.ok) throw new Error('Failed to fetch dates');
        const dates = await response.json();
        return dates; // Returns ["2023-01-01", ...]
    } catch (error) {
        console.error("Error fetching available dates:", error);
        return [];
    }
};

export const getImagesForDate = async (date: string): Promise<EpicImage[]> => {
    try {
        // date format should be YYYY-MM-DD
        const response = await fetch(`${BASE_URL}/api/natural/date/${date}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const images = await response.json();
        return images;
    } catch (error) {
        console.error(`Error fetching images for ${date}:`, error);
        return [];
    }
};

export const getImageUrl = (imageName: string, date: string) => {
    // Date comes in as "2023-01-01 00:00:00" usually in the metadata, or we can use the selected date string
    // If we have the date string YYYY-MM-DD
    const [year, month, day] = date.split('-');
    return `${BASE_URL}/archive/natural/${year}/${month}/${day}/png/${imageName}.png`;
};
