import React, { useState, useEffect } from "react";
import {
  Upload, Printer, Clock, MapPin, Calendar, Settings,
  Layout, Copy, Palette, FileText, Maximize, Grid,
  ChevronDown, ChevronUp, X, Check, AlertCircle
} from "lucide-react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./component/firebase";

const PrintPreview = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printerHubs, setPrinterHubs] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrinterHubs();
  }, []);

  const uploadFileToStorage = async (file) => {
    try {
      // Create a unique file name
      const fileName = `${Date.now()}-${file.name}`;
      
      // Create a reference to the file location
      const fileRef = ref(storage, `print-files/${fileName}`);
      
      // Upload the file
      const snapshot = await uploadBytes(fileRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  };

  const storePrintJob = async (file, fileUrl, settings) => {
    try {
      const printJobData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: fileUrl,
        settings: settings,
        status: 'pending',
        createdAt: new Date().toISOString(),
        scheduledDateTime: settings.scheduledDateTime || null,
        selectedHub: settings.selectedHub,
      };

      const docRef = await addDoc(collection(db, "printJobs"), printJobData);
      return docRef.id;
    } catch (error) {
      console.error("Error storing print job:", error);
      throw error;
    }
  };

  const fetchPrinterHubs = async () => {
    try {
      const hubsSnapshot = await getDocs(collection(db, "printerhubs"));
      const hubsData = hubsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrinterHubs(hubsData);
    } catch (error) {
      console.error("Error fetching printer hubs:", error);
    }
  };
  const handlePrintAll = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const printJobs = await Promise.all(
        files.map(async (fileData) => {
          // Upload file to Storage
          const fileUrl = await uploadFileToStorage(fileData.file);
          
          // Store print job in Firestore
          const jobId = await storePrintJob(
            fileData.file,
            fileUrl,
            fileData.settings
          );

          return {
            jobId,
            fileName: fileData.file.name,
            status: 'pending'
          };
        })
      );

      // Clear files after successful submission
      setFiles([]);
      setActiveFileId(null);

      // You might want to show a success message or redirect
      console.log("Print jobs created:", printJobs);

    } catch (error) {
      setError("Failed to submit print jobs. Please try again.");
      console.error("Error submitting print jobs:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    const newFiles = uploadedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      previewUrl: URL.createObjectURL(file),
      settings: {
        pageSize: "A4",
        orientation: "portrait",
        color: "color",
        copies: 1,
        pages: "all",
        pageRange: "",
        margin: "normal",
        fitToScreen: true,
        scheduledDateTime: "",
        selectedHub: "",
        quality: "normal"
      }
    }));

    setFiles([...files, ...newFiles]);
    if (newFiles.length > 0) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const FileSettingsPanel = ({ file, onUpdate }) => {
    const [localSettings, setLocalSettings] = useState(file.settings);

    const updateSetting = (key, value) => {
      const newSettings = { ...localSettings, [key]: value };
      setLocalSettings(newSettings);
      onUpdate(file.id, newSettings);
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Settings */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Copy className="w-4 h-4 mr-2" />
              Copies
            </label>
            <input
              type="number"
              min="1"
              value={localSettings.copies}
              onChange={(e) => updateSetting('copies', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Page Range
            </label>
            <div className="flex space-x-2">
              <select
                value={localSettings.pages}
                onChange={(e) => updateSetting('pages', e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Pages</option>
                <option value="range">Custom Range</option>
              </select>
              {localSettings.pages === 'range' && (
                <input
                  type="text"
                  placeholder="e.g., 1-3, 5"
                  value={localSettings.pageRange}
                  onChange={(e) => updateSetting('pageRange', e.target.value)}
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Layout className="w-4 h-4 mr-2" />
              Orientation
            </label>
            <select
              value={localSettings.orientation}
              onChange={(e) => updateSetting('orientation', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Palette className="w-4 h-4 mr-2" />
              Color Mode
            </label>
            <select
              value={localSettings.color}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="color">Color</option>
              <option value="blackAndWhite">Black & White</option>
              <option value="grayscale">Grayscale</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Grid className="w-4 h-4 mr-2" />
              Margin
            </label>
            <select
              value={localSettings.margin}
              onChange={(e) => updateSetting('margin', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="narrow">Narrow</option>
              <option value="wide">Wide</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Maximize className="w-4 h-4 mr-2" />
              Fit to Screen
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSettings.fitToScreen}
                onChange={(e) => updateSetting('fitToScreen', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Adjust to page size</span>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Print
              </label>
              <input
                type="datetime-local"
                value={localSettings.scheduledDateTime}
                onChange={(e) => updateSetting('scheduledDateTime', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 mr-2" />
                Printer Hub
              </label>
              <select
                value={localSettings.selectedHub}
                onChange={(e) => updateSetting('selectedHub', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Hub</option>
                {printerHubs.map(hub => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.address})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Print Preview</h1>
        <div className="flex space-x-4 w-full sm:w-auto">
          <label className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-full sm:w-auto">
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={handlePrintAll}
            disabled={submitting || files.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Printer className="w-5 h-5 mr-2" />
            {loading ? "Processing..." : "Print All"}
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Files</h2>
          {files.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all ${
                activeFileId === file.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveFileId(file.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{file.file.name}</h3>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFiles(files.filter(f => f.id !== file.id));
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Upload files to preview and print</p>
            </div>
          )}
        </div>

        {/* Preview and Settings */}
        <div className="lg:col-span-2">
          {activeFileId && files.find(f => f.id === activeFileId) && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                </div>
                <div className="p-4">
                  <div className="aspect-[1/1.414] bg-gray-50 rounded-lg overflow-hidden">
                    {files.find(f => f.id === activeFileId).file.type.includes("image") ? (
                      <img
                        src={files.find(f => f.id === activeFileId).previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={files.find(f => f.id === activeFileId).previewUrl}
                        title="Document Preview"
                        className="w-full h-full border-0"
                      />
                    )}
                  </div>
                </div>
              </div>

              <FileSettingsPanel
                file={files.find(f => f.id === activeFileId)}
                onUpdate={(id, settings) => {
                  setFiles(files.map(file =>
                    file.id === id ? { ...file, settings } : file
                  ));
                }}
              />
            </div>
          )}

          {!activeFileId && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a file to view and modify settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;