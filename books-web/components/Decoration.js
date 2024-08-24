import { useState, useEffect } from "react";
import { downloadFile, getDecorations } from "../utils/api";

const Decoration = ({ slotData }) => {

    const [decorationData, setDecorationData] = useState(null);
    const [decorationURL, setDecorationURL] = useState(null);

    // TODO: handle different types of decorations

    useEffect(() => {
        if (slotData) {
            getDecorations([slotData.decoration_id], setDecorationData);
        }
    }, [slotData]);

    useEffect(() => {
        if (decorationData) {
            downloadFile({
                uuid: decorationData.decoration_fname,
                setFileData: setDecorationURL
            });
        }
    }, [decorationData]);

    return (
        <div>
            {decorationURL && <img src={decorationURL} alt={`decoration-${decorationData.id}`} />}
        </div>
    );

};

export default Decoration;
