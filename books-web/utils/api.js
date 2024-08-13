import axios from 'axios';

const API_BASE_URL = 'http://your-api-url.com';

export const getCurrentLayout = async () => {
    const response = await axios.get(`${API_BASE_URL}/books/layout/current`);
    return response.data;
};

export const getShelves = async () => {
    const response = await axios.get(`${API_BASE_URL}/books/shelves`);
    return response.data;
};

export const getBookCovers = async (bookIds) => {
    const response = await axios.post(`${API_BASE_URL}/books/covers`, { book_ids: bookIds });
    return response.data;
};

export const getBooks = async () => {
    const response = await axios.get(`${API_BASE_URL}/books`);
    return response.data;
};

export const getDecorations = async (decorationIds) => {
    const response = await axios.post(`${API_BASE_URL}/books/decoration`, { dec_ids: decorationIds });
    return response.data;
};

// Add more functions as needed for book creation, updating, etc.
