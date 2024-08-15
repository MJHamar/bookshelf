import { setData, getData } from './api';

export const uploadFile = async (
    { file, setUuid, setUploading }
) => {
    console.log(`uploading file: ${file}`);
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:3140/data', {
        method: 'POST',
        body: formData,
    });

    const id = await res.text();
    setUuid(id);
    setUploading(false);
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
