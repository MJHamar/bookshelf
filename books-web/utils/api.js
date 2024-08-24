import axios from 'axios';
import { api_url } from '@/config';

export const DEF_COVER_ID = "77004530-4d29-4e00-940d-d2654b8e7f04"
export const DEF_SPINE_ID = "a90e6325-edfa-4bcb-961f-a3d2abad79ef"

export const getCurrentLayout = async (setLayout) => {
    const response = await axios.get(`${api_url}/books/current_layout`);
    setLayout(response.data);
};

export const getShelves = async (layout_id, setShelves) => {
    const response = await axios.get(`${api_url}/books/shelves/${layout_id}`);
    setShelves(response.data);
};

export const getB2SMapping = async (layout_id, setBook2ShelfMap) => {
    const response = await axios.get(`${api_url}/books/b2s/${layout_id}`);
    let b2s_map = [];
    response.data.forEach(b2s => {
        b2s_map[b2s.shelf_id] = b2s;
    });
    setBook2ShelfMap(b2s_map);
};

export const getBook = async (book_ids, setBook) => {
    // check if book_ids is an array
    if (!Array.isArray(book_ids)) {
        book_ids = [book_ids];
    }
    const response = await axios.post(`${api_url}/books`, { book_ids: book_ids });
    setBook(response.data[0]);
};

export const getBookCover = async (book_ids, setCover) => {
    // check if book_ids is an array
    if (!Array.isArray(book_ids)) {
        book_ids = [book_ids];
    }
    const response = await axios.post(`${api_url}/books/covers`, { book_ids: book_ids });
    setCover(response.data);
};

export const getBookProgress = async (book_ids, setProgress) => {
    // check if book_ids is an array
    if (!Array.isArray(book_ids)) {
        book_ids = [book_ids];
    }
    const response = await axios.post(`${api_url}/books/progress`, { book_ids: book_ids });
    setProgress(response.data[0]);
}

export const getBookProgressReads = async (book_id, setProgressReads) => {
    const response = await axios.get(`${api_url}/books/progress/reads/${book_id}`);
    setProgressReads(response.data);
}

export const getDecorationSlots = async (layout_id, setDecorationSlots) => {
    const response = await axios.get(`${api_url}/books/decoration_slots/${layout_id}`);
    setDecorationSlots(response.data);
};

export const getDecorations = async (decorationIds, setDecoration) => {
    const response = await axios.post(`${api_url}/books/decoration`, { dec_ids: decorationIds });
    setDecoration(response.data);
};

export const createBook = async (setBookView) => {
    const response = await axios.post(`${api_url}/books/create`);
    const view = response.data;
    setBookView({
        book_id: view.book.id,
        coverData: view.cover,
        bookData: view.book,
        progressData: view.progress,
    });
}

export const setBook = async (bookData) => {
    const response = await axios.post(`${api_url}/books/set`, bookData);
    return response.data;
}

export const setB2SMapping = async (layout_id, b2sData) => {
    console.log(`API:: setB2SMapping: ${JSON.stringify(b2sData)}`);
    const response = await axios.post(`${api_url}/books/b2s/${layout_id}`, b2sData);
    return response.data;
}

export const setBookCover = async (coverData) => {
    const response = await axios.post(`${api_url}/books/covers/set`, coverData);
    return response.data;
}

export const setBookProgress = async (progressData) => {
    const response = await axios.post(`${api_url}/books/progress/set`, progressData);
    return response.data;
}

export const checkBookProgressRead = async (book_id) => {
    const response = await axios.post(`${api_url}/books/progress/reads/${book_id}`);
    return response.data;
}

export const setDecorationSlot = async (slotData) => {
    const response = await axios.post(`${api_url}/books/decoration_slots/set`, slotData);
    return response.data;
}

export const setDecoration = async (decorationData) => {
    const response = await axios.post(`${api_url}/books/decoration/set`, decorationData);
    return response.data;
}

export const uploadFile = async (
    { file, setUuid }
) => {
    console.log(`uploading file: ${file}`);
    if (!file) return;


    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:3140/data', {
        method: 'POST',
        body: formData,
    });

    const id = await res.text();
    setUuid(id);
};

export const downloadFile = async (
    { uuid, setFileData }
) => {
    const res = await fetch(`http://localhost:3140/data/${uuid}`, {
        method: 'GET',
    });

    if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setFileData(url);
    } else {
        setFileData(null);
        alert('File not found');
    }
};
