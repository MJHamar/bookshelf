import axios from 'axios';

const API_BASE_URL = 'http://localhost:3140';


export const getCurrentLayout = async () => {
    const response = await axios.get(`${API_BASE_URL}/books/current_layout`);
    console.log(`current layout: ${JSON.stringify(response.data)}`);
    return response.data;
};

export const getShelves = async (layout_id) => {
    const response = await axios.get(`${API_BASE_URL}/books/shelves/${layout_id}`);
    return response.data;
};

export const getB2SMapping = async (layout_id) => {
    const response = await axios.get(`${API_BASE_URL}/books/b2s/${layout_id}`);
    return response.data;
};

export const getBooks = async (book_ids) => {
    const response = await axios.post(`${API_BASE_URL}/books`, { book_ids });
    return response.data;
};

export const getBookCovers = async (book_ids) => {
    const response = await axios.post(`${API_BASE_URL}/books/covers`, { book_ids });
    return response.data;
};

export const getBookProgress = async (book_ids) => {
    const response = await axios.post(`${API_BASE_URL}/books/progress`, { book_ids });
    return response.data;
}

export const getDecorationSlots = async (layout_id) => {
    const response = await axios.get(`${API_BASE_URL}/books/decoration_slots/${layout_id}`);
    return response.data;
};

export const getDecorations = async (decorationIds) => {
    const response = await axios.post(`${API_BASE_URL}/books/decoration`, { dec_ids: decorationIds });
    return response.data;
};

// Add more functions as needed for book creation, updating, etc.
export const createBook = async () => {
    const response = await axios.post(`${API_BASE_URL}/books/create`);
    return response.data; // this will be a view over all book details
}

{/* 
    API endpoints we want to implement:
            .route("/books/create", web::post().to(bookshelf::set_book))
            .route("/books/covers/set", web::post().to(bookshelf::set_book_cover))
            .route("/books/progress/set", web::post().to(bookshelf::set_book_progress))
            .route("/books/decoration_slots/set", web::post().to(bookshelf::set_decoration_slot))
            .route("/books/decoration/set", web::post().to(bookshelf::set_decoration))
    */}