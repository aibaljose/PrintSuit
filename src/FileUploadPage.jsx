import { useState } from "react";

const PrintPreview = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [pageSize, setPageSize] = useState("A4");
    const [orientation, setOrientation] = useState("portrait");

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        // Create preview URL for images & PDFs
        const url = URL.createObjectURL(uploadedFile);
        setPreviewUrl(url);
    };

    const sendToServer = async () => {
        if (!file) {
            alert("Please upload a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("pageSize", pageSize);
        formData.append("orientation", orientation);

        try {
            const response = await fetch("http://localhost:3000/print", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Printing failed:", error);
        }
    };

    return (
        <div className="container">
            <h2>Live Print Preview</h2>

            <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileUpload} />

            <div className="settings">
                <label>Page Size:</label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                </select>

                <label>Orientation:</label>
                <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                </select>
            </div>

            <div className="preview-container">
                <h3>Live Preview</h3>
                {file && file.type.includes("image") && (
                    <img src={previewUrl} alt="Preview" className={`preview ${orientation}`} />
                )}
                {file && file.type === "application/pdf" && (
                    <iframe
                        src={previewUrl}
                        title="PDF Preview"
                        className={`preview ${orientation}`}
                    ></iframe>
                )}
            </div>

            <button onClick={sendToServer}>Print</button>

            <style>
                {`
                .container { font-family: Arial, sans-serif; padding: 20px; }
                input, select, button { margin-top: 10px; padding: 8px; width: 100%; }
                .preview-container { margin-top: 20px; border: 1px solid #ccc; padding: 10px; }
                .preview { width: 100%; height: 500px; border: 1px solid #ddd; }
                .portrait { transform: rotate(0); }
                .landscape { transform: rotate(90deg); transform-origin: top left; }
                `}
            </style>
        </div>
    );
};

export default PrintPreview;
