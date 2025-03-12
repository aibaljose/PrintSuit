// First, install pdf-lib:
// npm install pdf-lib

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, ChevronDown, ChevronUp, X, Calendar, Clock,Eye } from 'lucide-react';
import { db, collection, getDocs, addDoc, getDoc, doc, updateDoc, deleteDoc } from "./component/firebase";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Nav from "./nav"
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import PDFPreview from './pdfpreview';

// Add this constant at the top of your file with other constants
const PAPER_SIZES = {
  'A4': { width: 210, height: 297, name: 'A4 (210 × 297 mm)' },
  'A3': { width: 297, height: 420, name: 'A3 (297 × 420 mm)' },
  'Letter': { width: 216, height: 279, name: 'Letter (216 × 279 mm)' },
  'Legal': { width: 216, height: 356, name: 'Legal (216 × 356 mm)' }
};

const FileUploadPrint = () => {
  const [previewFile, setPreviewFile] = useState(null);
  const location = useLocation();
  const { hubname } = location.state || {};
  const navigate = useNavigate();

  // Common schedule state for all files
  const [schedule, setSchedule] = useState({
    type: 'immediate',  // 'immediate' or 'scheduled'
    date: '',
    time: ''
  });

  const [amount, setAmount] = useState(0);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      setAmount(files.reduce((sum, file) => sum + parseFloat(calculatePrice(file)), 0).toFixed(2));
      const { data: order } = await axios.post("http://localhost:5000/create-order",
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const options = {
        key: "rzp_test_5fIpDiq0CC4SjF",
        amount: amount,
        currency: "INR",
        name: "PrintSuit",
        description: "PrintFrom anywhere",
        order_id: order.id,
        handler: async function (response) {
          await axios.post("http://localhost:5000/verify-payment",
            response,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const printJobId = await storePrintJob(response);
          alert("Payment Successful!");
          console.log(response);
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#0000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const [files, setFiles] = useState([]);
  const [expandedFile, setExpandedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const storedToken = localStorage.getItem("token");

  const storePrintJob = async (paymentResponse) => {
    try {
      const decoded = jwtDecode(storedToken);
      const userId = decoded.uid;

      const printJobData = {
        userId: userId || "unknown_user",
        hubName: hubname || "unknown_hub",
        createdAt: new Date().toISOString(),
        paymentId: paymentResponse?.razorpay_payment_id || "unknown_payment",
        orderId: paymentResponse?.razorpay_order_id || "unknown_order",
        totalAmount: amount || 0,
        status: "pending",
        // Add common schedule to the main job object
        schedule: {
          type: schedule.type,
          date: schedule.date,
          time: schedule.time
        },
        files: files.map(file => ({
          fileName: file?.file?.name || "unknown_file",
          pageCount: file?.settings?.pageCount || 1,
          settings: {
            color: file?.settings?.color || "black",
            orientation: file?.settings?.orientation || "portrait",
            copies: file?.settings?.copies || 1,
            doubleSided: file?.settings?.doubleSided ?? false,
            pageRange: file?.settings?.pageRange || "all",
            customRange: file?.settings?.customRange || "",
            // Remove individual schedule from file settings
          },
          price: calculatePrice(file) || 0
        }))
      };

      const docRef = await addDoc(collection(db, 'printJobs'), printJobData);
      console.log("Print job stored with ID: ", docRef.id);
      navigate("/paysucess", { state: { jobid: docRef.id } });
      return docRef.id;
    } catch (error) {
      console.error("Error storing print job:", error);
      throw error;
    }
  };

  // Price configuration
  const priceConfig = {
    bwSingle: 2,
    bwDouble: 3,
    colorSingle: 8,
    colorDouble: 12
  };

  const getPageCount = async (file) => {
    try {
      // Only process PDF files
      if (file.type !== 'application/pdf') {
        throw new Error('Not a PDF file');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Error counting pages:', error);
      return 1; // Default to 1 page for non-PDF files or errors
    }
  };

  const handleFileUpload = async (e) => {
    setLoading(true);
    const uploadedFiles = Array.from(e.target.files);

    try {
      const processedFiles = await Promise.all(uploadedFiles.map(async (file) => {
        const pageCount = await getPageCount(file);
        return {
          file,
          id: Math.random().toString(36).substr(2, 9),
          settings: {
            pageCount,
            color: false,
            orientation: 'portrait',
            fitToPage: true,
            doubleSided: false,
            copies: 1,
            pageRange: 'all',
            customRange: '',
            paperSize: 'A4', // Add default paper size
          },
          type: file.type,
          size: file.size,
        };
      }));

      setFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validatePageRange = (range) => {
    // Validate format: "1-3,5,7-9"
    const pattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    return pattern.test(range);
  };

  const calculatePrice = (file) => {
    const { settings } = file;
    let pageCount;

    if (settings.pageRange === 'all') {
      pageCount = settings.pageCount;
    } else {
      if (!validatePageRange(settings.customRange)) return 0;

      pageCount = settings.customRange.split(',').reduce((acc, range) => {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(Number);
          if (end >= start && end <= settings.pageCount) {
            return acc + (end - start + 1);
          }
        } else {
          const page = Number(range);
          if (page <= settings.pageCount) {
            return acc + 1;
          }
        }
        return acc;
      }, 0);
    }

    const basePrice = settings.color
      ? (settings.doubleSided ? priceConfig.colorDouble : priceConfig.colorSingle)
      : (settings.doubleSided ? priceConfig.bwDouble : priceConfig.bwSingle);

    return (basePrice * pageCount * settings.copies).toFixed(2);
  };

  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
    if (expandedFile === id) setExpandedFile(null);
  };

  return (
    <>
      <Nav></Nav>
      <div className="min-h-screen bg-gray-50 p-6 mt-20">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li className="inline-flex items-center">
              <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                </svg>
                <a href="#" className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">locate</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                </svg>
                <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">upload</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-lg shadow-sm p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Upload Files for Printing</h1>
            <p className="text-gray-600 mt-2">
              Supported formats: PDF (.pdf) for accurate page count
            </p>
            <p>Hub Name: {hubname}</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white p-6 shadow-sm border-b">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  {loading ? 'Processing files...' : 'Drag and drop PDF files here or click to browse'}
                </p>
                <button
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : ''}
                </button>
              </label>
            </div>
          </div>

          {/* Common Schedule Section - Moved from individual files to common section */}
          {files.length > 0 && (
            <div className="bg-white p-6 shadow-sm border-b">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Schedule Print Job</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={schedule.type}
                    onChange={(e) => setSchedule({ ...schedule, type: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="immediate">Immediate Printing</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                {schedule.type === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Pick Date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={schedule.date}
                        onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4" />
                        Pick Time
                      </label>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4">
                  {schedule.type === 'immediate'
                    ? 'Your print job will be processed immediately after payment.'
                    : 'Your print job will be processed at the scheduled time. Please ensure you submit before your desired print time.'}
                </p>
              </div>
            </div>
          )}

          {/* Files List */}
          {files.length > 0 && (
            <div className="bg-white rounded-b-lg shadow-sm">
              {files.map(file => (
                <div key={file.id} className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-800">{file.file.name}</h3>
                        <p className="text-sm text-gray-500">
                          {file.settings.pageCount} pages • {formatFileSize(file.size)} •
                          {file.type === 'application/pdf' ? ' PDF' : ' Unknown format'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-gray-700">
                        ₹{calculatePrice(file)}
                      </span>
                      <button
                        onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedFile === file.id ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X />
                      </button>
                    </div>
                   
                  </div>

                  {/* Print settings - removed individual schedule section */}
                  {expandedFile === file.id && (
                    <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Print Type
                        </label>
                        <select
                          value={file.settings.color ? 'color' : 'bw'}
                          onChange={(e) => {
                            const newFiles = [...files];
                            const index = newFiles.findIndex(f => f.id === file.id);
                            newFiles[index].settings.color = e.target.value === 'color';
                            setFiles(newFiles);
                          }}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="bw">Black & White</option>
                          <option value="color">Color</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orientation
                        </label>
                        <select
                          value={file.settings.orientation}
                          onChange={(e) => {
                            const newFiles = [...files];
                            const index = newFiles.findIndex(f => f.id === file.id);
                            newFiles[index].settings.orientation = e.target.value;
                            setFiles(newFiles);
                          }}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Copies
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={file.settings.copies}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);

                            if (!isNaN(newValue) && newValue > 0) {
                              const newFiles = [...files];
                              const index = newFiles.findIndex((f) => f.id === file.id);
                              newFiles[index].settings.copies = newValue;
                              setFiles(newFiles);
                            }
                          }}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Page Range
                        </label>
                        <select
                          value={file.settings.pageRange}
                          onChange={(e) => {
                            const newFiles = [...files];
                            const index = newFiles.findIndex(f => f.id === file.id);
                            newFiles[index].settings.pageRange = e.target.value;
                            setFiles(newFiles);
                          }}
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="all">All Pages</option>
                          <option value="custom">Custom Range</option>
                        </select>
                      </div>
                     
                      {file.settings.pageRange === 'custom' && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Range (e.g., 1-3,5,7-9)
                          </label>
                          <input
                            type="text"
                            value={file.settings.customRange}
                            onChange={(e) => {
                              const newFiles = [...files];
                              const index = newFiles.findIndex(f => f.id === file.id);
                              newFiles[index].settings.customRange = e.target.value;
                              setFiles(newFiles);
                            }}
                            className="w-full p-2 border rounded-lg"
                            placeholder="1-3,5,7-9"
                          />
                        </div>
                      )}

                      <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={file.settings.doubleSided}
                            onChange={(e) => {
                              const newFiles = [...files];
                              const index = newFiles.findIndex(f => f.id === file.id);
                              newFiles[index].settings.doubleSided = e.target.checked;
                              setFiles(newFiles);
                            }}
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm text-gray-700">Double-sided printing</span>
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={file.settings.fitToPage}
                            onChange={(e) => {
                              const newFiles = [...files];
                              const index = newFiles.findIndex(f => f.id === file.id);
                              newFiles[index].settings.fitToPage = e.target.checked;
                              setFiles(newFiles);
                            }}
                            className="rounded text-blue-500"
                          />
                          <span className="text-sm text-gray-700">Fit to page</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paper Size
                        </label>
                        <select
                          value={file.settings.paperSize}
                          onChange={(e) => {
                            const newFiles = [...files];
                            const index = newFiles.findIndex(f => f.id === file.id);
                            newFiles[index].settings.paperSize = e.target.value;
                            setFiles(newFiles);
                          }}
                          className="w-full p-2 border rounded-lg"
                        >
                          {Object.entries(PAPER_SIZES).map(([size, details]) => (
                            <option key={size} value={size}>
                              {details.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                      onClick={() => setPreviewFile(previewFile?.id === file.id ? null : file)}
                      className="text-gray-400 hover:text-gray-600"
                    ><Eye className="mr-2 text-gray-600" />
                      {previewFile?.id === file.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                      {previewFile?.id === file.id && (
                        <div className="mt-4 col-span-2">
                          <PDFPreview
                            file={file.file}
                            settings={{
                              ...file.settings,
                              paperSize: PAPER_SIZES[file.settings.paperSize]
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Total Price */}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-2xl font-bold text-gray-800">
                    ₹{files.reduce((sum, file) => sum + parseFloat(calculatePrice(file)), 0).toFixed(2)}
                  </span>
                </div>

                <button onClick={handlePayment} className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FileUploadPrint;