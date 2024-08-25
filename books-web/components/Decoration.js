import { useState, useEffect } from "react";
import { downloadFile, getDecorations } from "../utils/api";

const Decoration = ({ slotData }) => {

    const [decorationData, setDecorationData] = useState(null);
    const [decorationURL, setDecorationURL] = useState(null);

    // TODO: handle different types of decorations

    useEffect(() => {
        if (slotData) {
            getDecorations([slotData.decoration_id], (data) => setDecorationData(data[0]));
        }
    }, [slotData]);

    useEffect(() => {
        console.log("decorationData", decorationData);
        if (decorationData) {
            downloadFile({
                uuid: decorationData.decoration_fname,
                setFileData: setDecorationURL
            });
        }
    }, [decorationData]);

    return (
        <div style={{width:'100%', height:'100%'}}>
            {decorationURL && <img style={{ width: '100%', height: '100%' }} src={decorationURL} alt={`decoration-${decorationData.id}`} />}
        </div>
    );

};

export default Decoration;
