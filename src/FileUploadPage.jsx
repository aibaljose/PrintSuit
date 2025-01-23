import React, { useState } from "react";

const FileUploadPage = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const [settings, setSettings] = useState({
    paperSize: "A4",
    colorMode: "Color",
    layout: "Portrait",
  });
  const [darkMode, setDarkMode] = useState(true); // Toggle for dark/light mode

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];

    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!validTypes.includes(uploadedFile.type)) {
      alert("Unsupported file type! Please upload a PDF, image, or Office file.");
      return;
    }

    setFile(uploadedFile);
    setFileType(uploadedFile.type);

    if (uploadedFile.type.startsWith("image") || uploadedFile.type === "application/pdf") {
      const fileURL = URL.createObjectURL(uploadedFile);
      setFilePreview(fileURL);
    } else {
      setFilePreview(null);
    }
  };

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const renderFilePreview = () => {
    if (!filePreview) {
      return <p className="text-gray-500">No preview available for this file type.</p>;
    }

    if (fileType === "application/pdf") {
      return <iframe src={filePreview} className="w-full h-96 border rounded-lg"></iframe>;
    }

    if (fileType.startsWith("image")) {
      return <img src={filePreview} alt="File Preview" className="w-full max-h-96 rounded-lg" />;
    }

    return <p className="text-gray-500">No preview available for this file type.</p>;
  };

  const handleSubmit = () => {
    if (!file) {
      alert("Please upload a file before submitting.");
      return;
    }
    alert(`File uploaded successfully with settings: ${JSON.stringify(settings)}`);
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Settings</h2>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-4 py-2"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="paperSize" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Paper Size
              </label>
              <select
                id="paperSize"
                name="paperSize"
                value={settings.paperSize}
                onChange={handleSettingsChange}
                className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label htmlFor="colorMode" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Color Mode
              </label>
              <select
                id="colorMode"
                name="colorMode"
                value={settings.colorMode}
                onChange={handleSettingsChange}
                className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Color">Color</option>
                <option value="Black & White">Black & White</option>
              </select>
            </div>
            <div>
              <label htmlFor="layout" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Layout
              </label>
              <select
                id="layout"
                name="layout"
                value={settings.layout}
                onChange={handleSettingsChange}
                className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 text-gray-100 bg-indigo-500 rounded-lg shadow hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-400"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Upload and Preview</h2>
          <div className="mb-6">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              Upload File
            </label>
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.png,.jpeg,.jpg,.docx,.xlsx,.pptx"
              onChange={handleFileUpload}
              className="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">File Preview</h3>
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
