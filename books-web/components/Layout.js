import { useEffect, useState } from "react";
import { downloadFile, uploadFile } from "../utils/api";

const Layout = ({ layoutData }) => {
    const [layoutURL, setLayoutURL] = useState(null);
    const [layoutSVG, setLayoutSVG] = useState(null);
    const [layoutTextureURL, setLayoutTextureURL] = useState(null);

    useEffect(() => {
        if (layoutData) {
            downloadFile({
                uuid: layoutData.layout_fname,
                setFileData: setLayoutURL
            });
            if (layoutData.texture_fname) {
                downloadFile({
                    uuid: layoutData.texture_fname,
                    setFileData: setLayoutTextureURL
                });
            }
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
        <div style={{ top:0, left:0, width: '100%', height: '100%'}}>
            {layoutTextureURL && <img style={{ position: 'absolute', zIndex: '1', top: 0, left: 0, width: '100%', height: '100%' }} src={layoutTextureURL} alt={`texture-${layoutData.id}`} />}
            {layoutSVG && <div style={{ position: 'absolute', zIndex: '10', top: 0, left: 0, width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: layoutSVG }} />}
        </div>
    );
};

export default Layout;