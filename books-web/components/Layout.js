import { useEffect, useState } from "react";
import { downloadFile, uploadFile } from "../utils/api";

const Layout = ({ layoutData }) => {
    const [layoutURL, setLayoutURL] = useState(null);
    const [layoutSVG, setLayoutSVG] = useState(null);
    
    useEffect(() => {
        if (layoutData) {
            downloadFile({
                uuid: layoutData.layout_fname,
                setFileData: setLayoutURL
            });
        }
    }, [layoutData]);

    useEffect(() => {
        if (!layoutURL) {
            return;
        }
        const fetchLayoutSVG = async () => {
            fetch(layoutURL)
                .then((response) => response.text())
                .then((data) => {
                    setLayoutSVG(data);
                })
                .catch((error) => {
                    console.error('Error loading SVG:', error);
                });
        };
        fetchLayoutSVG();
    }, [layoutURL]);

    return (
        <div>
            {layoutSVG && <div dangerouslySetInnerHTML={{ __html: layoutSVG }} />}
        </div>
    );
};

export default Layout;