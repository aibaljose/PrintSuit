// import React, { useState, useRef, useEffect } from "react";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";
// import { 
//   Printer, 
//   RotateCw, 
//   Upload,
//   FileText,
//   Maximize,
//   Palette,
//   Copy,
//   Layers,
//   Settings,
//   Columns,
//   BookOpen,
//   X,
//   ZoomIn,
//   File,
//   ChevronDown,
//   Check
// } from "lucide-react";

// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// const paperSizes = {
//   A4: { width: 595, height: 842 },
//   A3: { width: 842, height: 1191 },
//   Letter: { width: 612, height: 792 },
//   Legal: { width: 612, height: 1008 },
// };

// const printSettings = {
//   quality: ["Draft", "Normal", "High"],
//   margins: ["Default", "Narrow", "Wide", "Custom"],
//   fitToPage: ["Actual Size", "Fit to Page", "Fit to Width", "Fit to Height"],
// };

// const defaultSettings = {
//   paperSize: "A4",
//   orientation: "portrait",
//   colorMode: "color",
//   copies: 1,
//   duplex: "single",
//   quality: "Normal",
//   margins: "Default",
//   pageRange: "all",
//   scale: "1",
//   fitToPage: "Actual Size",
// };

// export default function PDFToImageConverter() {
//   const [files, setFiles] = useState([]);
//   const [activeFileIndex, setActiveFileIndex] = useState(0);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [fileSettings, setFileSettings] = useState({});
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const handleFileChange = (e) => {
//     const newFiles = Array.from(e.target.files).filter(file => file.type === "application/pdf");
//     setFiles(prev => [...prev, ...newFiles]);
//     newFiles.forEach(file => {
//       setFileSettings(prev => ({
//         ...prev,
//         [file.name]: { ...defaultSettings }
//       }));
//     });
//   };

//   const removeFile = (index) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//     if (activeFileIndex >= index) {
//       setActiveFileIndex(prev => Math.max(0, prev - 1));
//     }
//   };

//   const updateSetting = (fileName, key, value) => {
//     setFileSettings(prev => ({
//       ...prev,
//       [fileName]: {
//         ...prev[fileName],
//         [key]: value
//       }
//     }));
//   };

//   const Modal = ({ isOpen, onClose, children }) => {
//     if (!isOpen) return null;
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">Print Settings</h2>
//             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//           {children}
//         </div>
//       </div>
//     );
//   };

//   const FileCard = ({ file, index, isActive }) => (
//     <div 
//       className={`flex items-center p-4 border rounded-lg mb-2 cursor-pointer transition-all ${
//         isActive ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
//       }`}
//       onClick={() => setActiveFileIndex(index)}
//     >
//       <File className="h-5 w-5 mr-3 text-gray-600" />
//       <span className="flex-1 truncate">{file.name}</span>
//       <button 
//         onClick={(e) => {
//           e.stopPropagation();
//           removeFile(index);
//         }}
//         className="p-1 hover:bg-gray-200 rounded-full"
//       >
//         <X className="h-4 w-4" />
//       </button>
//     </div>
//   );

//   const SettingRow = ({ icon, label, children }) => (
//     <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-3">
//       <div className="flex items-center gap-2 min-w-[200px]">
//         {icon}
//         <span className="font-medium text-gray-700">{label}</span>
//       </div>
//       {children}
//     </div>
//   );
//   const renderPDF = async () => {
//     if (files.length === 0) return;

//     const activeFile = files[activeFileIndex];
//     const reader = new FileReader();

//     reader.onload = async (event) => {
//       const pdf = await pdfjsLib.getDocument(event.target.result).promise;
//       const page = await pdf.getPage(1);
//       const settings = fileSettings[activeFile.name];

//       // Get the PDF's original dimensions
//       const originalViewport = page.getViewport({ scale: 1 });
//       const pdfWidth = originalViewport.width;
//       const pdfHeight = originalViewport.height;

//       // Get selected paper size dimensions
//       const { width: paperWidth, height: paperHeight } = paperSizes[settings.paperSize];

//       // Calculate dimensions based on orientation
//       const targetWidth = settings.orientation === "portrait" ? paperWidth : paperHeight;
//       const targetHeight = settings.orientation === "portrait" ? paperHeight : paperWidth;

//       // Calculate the scale needed to fit the PDF to the paper size
//       let scale;
//       switch (settings.fitToPage) {
//         case "Fit to Page":
//           scale = Math.min(
//             targetWidth / pdfWidth,
//             targetHeight / pdfHeight
//           );
//           break;
//         case "Fit to Width":
//           scale = targetWidth / pdfWidth;
//           break;
//         case "Fit to Height":
//           scale = targetHeight / pdfHeight;
//           break;
//         default: // "Actual Size"
//           scale = 1;
//       }

//       // Apply any user-specified scale adjustment
//       const userScale = parseFloat(settings.scale) || 1;
//       const finalScale = scale * userScale;

//       // Create viewport with the calculated scale
//       const viewport = page.getViewport({ scale: finalScale });

//       // Set canvas dimensions to match the paper size
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       canvas.width = targetWidth;
//       canvas.height = targetHeight;

//       // Center the PDF content on the canvas if smaller than paper
//       const xOffset = Math.max(0, (targetWidth - viewport.width) / 2);
//       const yOffset = Math.max(0, (targetHeight - viewport.height) / 2);

//       // Clear the canvas before rendering
//       ctx.fillStyle = "white";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Render the PDF with proper positioning
//       const renderContext = {
//         canvasContext: ctx,
//         viewport,
//         transform: [1, 0, 0, 1, xOffset, yOffset]
//       };

//       await page.render(renderContext).promise;
//     };

//     reader.readAsDataURL(activeFile);
//   };

//   useEffect(() => {
//     renderPDF();
//   }, [activeFileIndex, fileSettings, files]);

//   return (
//     <div className="max-w-6xl mx-auto mt-8 px-4">
//       <div className="bg-white rounded-xl shadow-xl p-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">PDF Document Converter</h1>
//           <p className="text-gray-600 mt-2">Convert and customize your PDF documents</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-1">
//             <div className="mb-6">
//               <div
//                 className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-600">
//                   Click to upload or drag and drop PDFs
//                 </p>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="application/pdf"
//                   onChange={handleFileChange}
//                   multiple
//                   className="hidden"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               {files.map((file, index) => (
//                 <FileCard 
//                   key={index}
//                   file={file}
//                   index={index}
//                   isActive={index === activeFileIndex}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="lg:col-span-2">
//             <div className="flex justify-between items-center mb-4">
//               <button
//                 onClick={() => setIsSettingsOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <Settings className="h-4 w-4" />
//                 Print Settings
//                 <ChevronDown className="h-4 w-4" />
//               </button>

//               <button
//                 onClick={() => {/* implement print */}}
//                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 disabled={files.length === 0}
//               >
//                 <Printer className="h-4 w-4" />
//                 Print Document
//               </button>
//             </div>

//             <div className="border rounded-lg p-4 bg-gray-50">
//               <canvas ref={canvasRef} className="max-w-full mx-auto shadow-lg" />
//             </div>
//           </div>
//         </div>

//         <Modal 
//           isOpen={isSettingsOpen} 
//           onClose={() => setIsSettingsOpen(false)}
//         >
//           {files[activeFileIndex] && (
//             <div className="space-y-4">
//               <SettingRow icon={<FileText className="h-5 w-5 text-gray-600" />} label="Paper Size">
//                 <select
//                   value={fileSettings[files[activeFileIndex].name]?.paperSize}
//                   onChange={(e) => updateSetting(files[activeFileIndex].name, 'paperSize', e.target.value)}
//                   className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                 >
//                   {Object.keys(paperSizes).map((size) => (
//                     <option key={size} value={size}>{size}</option>
//                   ))}
//                 </select>
//               </SettingRow>

//               <SettingRow icon={<ZoomIn className="h-5 w-5 text-gray-600" />} label="Fit To Page">
//                 <select
//                   value={fileSettings[files[activeFileIndex].name]?.fitToPage}
//                   onChange={(e) => updateSetting(files[activeFileIndex].name, 'fitToPage', e.target.value)}
//                   className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//                 >
//                   {printSettings.fitToPage.map((option) => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </SettingRow>
//               <SettingRow icon={<FileText className="h-5 w-5 text-gray-600" />} label="Paper Size">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.paperSize}
//               onChange={(e) => updateSetting('paperSize', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               {Object.keys(paperSizes).map((size) => (
//                 <option key={size} value={size}>{size}</option>
//               ))}
//             </select>
//           </SettingRow>

//           <SettingRow icon={<Maximize className="h-5 w-5 text-gray-600" />} label="Orientation">
//             <button
//               onClick={() => updateSetting('orientation', fileSettings[files[activeFileIndex].name]?.orientation === "portrait" ? "landscape" : "portrait")}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               <RotateCw className="h-4 w-4" />
//               {fileSettings[files[activeFileIndex].name]?.orientation === "portrait" ? "Switch to Landscape" : "Switch to Portrait"}
//             </button>
//           </SettingRow>

//           <SettingRow icon={<Palette className="h-5 w-5 text-gray-600" />} label="Color Mode">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.colorMode}
//               onChange={(e) => updateSetting('colorMode', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="color">Color</option>
//               <option value="bw">Black & White</option>
//             </select>
//           </SettingRow>

//           <SettingRow icon={<Copy className="h-5 w-5 text-gray-600" />} label="Copies">
//             <input
//               type="number"
//               min="1"
//               value={fileSettings[files[activeFileIndex].name]?.copies}
//               onChange={(e) => updateSetting('copies', parseInt(e.target.value))}
//               className="block w-24 px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             />
//           </SettingRow>

//           <SettingRow icon={<Layers className="h-5 w-5 text-gray-600" />} label="Duplex Printing">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.duplex}
//               onChange={(e) => updateSetting('duplex', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="single">Single-sided</option>
//               <option value="double">Double-sided</option>
//             </select>
//           </SettingRow>

//           <SettingRow icon={<Settings className="h-5 w-5 text-gray-600" />} label="Print Quality">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.quality}
//               onChange={(e) => updateSetting('quality', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               {printSettings.quality.map((q) => (
//                 <option key={q} value={q}>{q}</option>
//               ))}
//             </select>
//           </SettingRow>

//           <SettingRow icon={<Columns className="h-5 w-5 text-gray-600" />} label="Margins">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.margins}
//               onChange={(e) => updateSetting('margins', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               {printSettings.margins.map((m) => (
//                 <option key={m} value={m}>{m}</option>
//               ))}
//             </select>
//           </SettingRow>

//           <SettingRow icon={<BookOpen className="h-5 w-5 text-gray-600" />} label="Page Range">
//             <select
//               value={fileSettings[files[activeFileIndex].name]?.pageRange}
//               onChange={(e) => updateSetting('pageRange', e.target.value)}
//               className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//             >
//               <option value="all">All Pages</option>
//               <option value="custom">Custom Range</option>
//             </select>
//           </SettingRow>

//               {/* Add all other settings rows here */}

//               {/* ... (Previous setting rows remain the same) ... */}
//             </div>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }


// First, install pdf-lib:
// npm install pdf-lib

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, ChevronDown, ChevronUp, X, Calendar, Clock } from 'lucide-react';
import { db, collection, getDocs, addDoc,getDoc, doc, updateDoc, deleteDoc } from "./component/firebase";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Nav from "./nav"
import { jwtDecode } from "jwt-decode";


import { useNavigate } from "react-router-dom";
const FileUploadPrint = () => {

  const location = useLocation();
  const { hubname } = location.state || {};

  const navigate = useNavigate();

  const [amount, setAmount] = useState(0); // Default ₹500
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
          headers: { Authorization: `Bearer ${token}` } // Add token to headers
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
              headers: { Authorization: `Bearer ${token}` } // Add token to headers
            }
            
          );
          const printJobId = await storePrintJob(response);
          alert("Payment Successful!");
          console.log(response)
         
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
      const userId =decoded.uid;// Get user ID from localStorage
      
      const printJobData = {
        userId: userId || "unknown_user",
        hubName: hubname || "unknown_hub",
        createdAt: new Date().toISOString(),
        paymentId: paymentResponse?.razorpay_payment_id || "unknown_payment",
        orderId: paymentResponse?.razorpay_order_id || "unknown_order",
        totalAmount: amount || 0,
        status: "pending",
        files: files.map(file => ({
          fileName: file?.file?.name || "unknown_file",
          pageCount: file?.settings?.pageCount || 1,
          settings: {
            color: file?.settings?.color || "black",
            orientation: file?.settings?.orientation || "portrait",
            copies: file?.settings?.copies || 1,
            doubleSided: file?.settings?.doubleSided ?? false, // Use nullish coalescing (??) to avoid `undefined`
            pageRange: file?.settings?.pageRange || "all",
            customRange: file?.settings?.customRange || "",
            schedule: file?.settings?.schedule || "immediate"
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
                <a href="#" className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">Projects</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                </svg>
                <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Flowbite</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="max-w-4xl  mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-lg shadow-sm p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Upload Files for Printing</h1>
            <p className="text-gray-600 mt-2">
              Supported formats: PDF (.pdf) for accurate page count
            </p>
            <p>Hub Name:{hubname}</p>
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

                  {/* Print settings UI remains the same as in previous version */}
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







                      <div className="col-span-2 bg-white p-4 rounded-lg border">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Schedule Print Job</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="w-4 h-4" />
                              Pick Date
                            </label>
                            <input
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={file.settings.schedule?.date || ''}
                              onChange={(e) => {
                                const newFiles = [...files];
                                const index = newFiles.findIndex(f => f.id === file.id);
                                newFiles[index].settings.schedule = {
                                  ...newFiles[index].settings.schedule,
                                  date: e.target.value
                                };
                                setFiles(newFiles);
                              }}
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
                              value={file.settings.schedule?.time || ''}
                              onChange={(e) => {
                                const newFiles = [...files];
                                const index = newFiles.findIndex(f => f.id === file.id);
                                newFiles[index].settings.schedule = {
                                  ...newFiles[index].settings.schedule,
                                  time: e.target.value
                                };
                                setFiles(newFiles);
                              }}
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                          Your print job will be processed at the scheduled time. Please ensure you submit before your desired print time.
                        </p>
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
                    </div>
                  )}
                  {/* ... */}
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


