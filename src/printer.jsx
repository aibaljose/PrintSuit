import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { CircularProgress, LinearProgress, Paper, Typography, Button, List, ListItem, Stack, Alert, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import VirtualPrinter from './components/VirtualPrinter';

// Your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCl-0h25pTIQNkoYW93fGf_Kw-HiWXlLFo",
  authDomain: "printsuit-3b5fb.firebaseapp.com",
  projectId: "printsuit-3b5fb",
  storageBucket: "printsuit-3b5fb.firebasestorage.app",
  messagingSenderId: "560781385855",
  appId: "1:560781385855:web:bc1fca2d9737fc8f75df4a"
  // Add your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  minHeight: '100px',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const PrinterSimulator = () => {
  const HUB_ID = "1";
  const [printerStatus, setPrinterStatus] = useState("Ready");
  const [currentJob, setCurrentJob] = useState(null);
  const [printQueue, setPrintQueue] = useState([]);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [supplies, setSupplies] = useState({
    toner: 100,
    paper: 100
  });
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Listen for new and updated print jobs with status filter
    const q = query(
      collection(db, "printJobs"),
      where("hubId", "==", HUB_ID),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const job = { id: change.doc.id, ...change.doc.data() };
        
        if (change.type === "added") {
          // Only handle new jobs
          handleNewPrintJob(job);
        }
      });
    });

    // Check scheduled jobs every minute
    const schedulerInterval = setInterval(checkScheduledJobs, 60000);

    return () => {
      unsubscribe();
      clearInterval(schedulerInterval);
    };
  }, []);

  useEffect(() => {
    // Process pending jobs automatically when queue changes
    const processPendingJobs = async () => {
      if (!isPrinting && !error && printQueue.length > 0) {
        const nextJob = printQueue[0];
        setPrintQueue(prev => prev.slice(1));
        await startPrinting(nextJob);
      }
    };

    processPendingJobs();
  }, [printQueue, isPrinting, error]);

  const handleNewPrintJob = (job) => {
    // Check if job already exists in queue by ID
    const jobExists = printQueue.some(queuedJob => queuedJob.id === job.id) ||
                     scheduledJobs.some(scheduledJob => scheduledJob.id === job.id);
    
    if (jobExists) {
      console.log(`Job ${job.id} already in queue, skipping`);
      return;
    }

    const isScheduled = job.schedule?.type === 'scheduled';
    const scheduleTime = job.schedule?.time;
    const scheduleDate = job.schedule?.date;

    if (isScheduled && scheduleDate && scheduleTime) {
      setScheduledJobs(prev => [...prev, job]);
    } else {
      // Add to print queue if not already processing or completed
      if (job.status === 'pending') {
        setPrintQueue(prev => [...prev, job]);
        updateJobStatus(job.id, "pending", null);
      }
    }
  };

  const checkScheduledJobs = () => {
    const now = new Date();
    const currentDateTime = now.toISOString().split('.')[0];

    setScheduledJobs(prev => {
      const readyJobs = [];
      const remainingJobs = [];

      prev.forEach(job => {
        const scheduledDateTime = `${job.schedule.date}T${job.schedule.time}`;
        
        if (scheduledDateTime <= currentDateTime) {
          readyJobs.push(job);
        } else {
          remainingJobs.push(job);
        }
      });

      // Add ready jobs to print queue
      readyJobs.forEach(job => {
        if (!isPrinting && !error) {
          startPrinting(job);
        } else {
          setPrintQueue(prev => [...prev, job]);
        }
      });

      return remainingJobs;
    });
  };

  const simulateError = () => {
    const errors = [
      { type: 'PAPER_JAM', message: 'Paper jam detected!' },
      { type: 'OUT_OF_PAPER', message: 'Out of paper' },
      { type: 'OUT_OF_TONER', message: 'Toner is empty' },
      { type: 'OFFLINE', message: 'Printer is offline' }
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    setError(randomError);
    updateJobStatus(currentJob?.id, 'error', randomError.message);
  };

  const resolveError = () => {
    setError(null);
    setSupplies({ toner: 100, paper: 100 });
    if (currentJob) {
      resumePrinting(currentJob);
    }
  };

  const updateJobProgress = async (jobId, currentPage, totalPages) => {
    if (!jobId) return;
    
    const jobRef = doc(db, "printJobs", jobId);
    const percentage = Math.round((currentPage / totalPages) * 100);
    
    const update = {
      progress: {
        currentPage,
        totalPages,
        percentage,
        lastUpdate: serverTimestamp()
      },
      last_updated: serverTimestamp()
    };

    // Update status to completed when progress is 100%
    if (percentage === 100) {
      update.status = 'completed';
      update.completed_time = serverTimestamp();
    }

    await updateDoc(jobRef, update);
  };

  const updateJobStatus = async (jobId, status, errorMessage = null) => {
    if (!jobId) return;
    
    const jobRef = doc(db, "printJobs", jobId);
    const update = {
      status: status,
      last_updated: serverTimestamp()
    };

    switch (status) {
      case "printing":
        update.printing_started = serverTimestamp();
        break;
      case "completed":
        update.completed_time = serverTimestamp();
        break;
      case "error":
        update.error_message = errorMessage;
        update.error_time = serverTimestamp();
        break;
      case "cancelled":
        update.cancelled_time = serverTimestamp();
        break;
      case "processing":
        update.processing_started = serverTimestamp();
        break;
    }

    await updateDoc(jobRef, update);
  };

  const resumePrinting = (job) => {
    setPrintQueue(prev => [job, ...prev]);
    setCurrentJob(null);
    setProgress(0);
  };

  const startPrinting = async (job) => {
    if (!job) return;
    
    setIsPrinting(true);
    setCurrentJob(job);
    setPrinterStatus("Printing");

    try {
      const jobRef = doc(db, "printJobs", job.id);
      const jobSnap = await getDoc(jobRef);
      const currentStatus = jobSnap.exists() ? jobSnap.data()?.status : null;

      // Set initial status to processing
      await updateJobStatus(job.id, "processing");

      // Calculate total pages
      const totalPages = job.files?.reduce((total, file) => 
        total + (file.pageCount * (file.settings?.copies || 1)), 0) || 1;
      
      let currentPage = 0;

      // Process each file
      for (const file of (job.files || [])) {
        const copies = file.settings?.copies || 1;
        
        for (let copy = 1; copy <= copies; copy++) {
          for (let page = 1; page <= file.pageCount; page++) {
            if (error) throw new Error(error.message);

            // Update supplies based on settings
            const colorMultiplier = file.settings?.color === 'color' ? 1.5 : 1;
            const doubleSidedMultiplier = file.settings?.doubleSided ? 0.5 : 1;

            setSupplies(prev => ({
              toner: Math.max(0, prev.toner - (0.5 * colorMultiplier)),
              paper: Math.max(0, prev.paper - (1 * doubleSidedMultiplier))
            }));

            // Check supplies
            if (supplies.paper < 1 || supplies.toner < 1) {
              throw new Error(supplies.paper < 1 ? "Out of paper" : "Out of toner");
            }

            currentPage++;
            const progressPercent = Math.round((currentPage / totalPages) * 100);
            setProgress(progressPercent);

            // Update progress and status
            await updateJobProgress(job.id, currentPage, totalPages);

            // Simulate printing time
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // Reset states
      setIsPrinting(false);
      setCurrentJob(null);
      setProgress(0);
      setPrinterStatus("Ready");

    } catch (error) {
      console.error("Printing error:", error);
      await updateJobStatus(job.id, "error", error.message);
      setError({ type: 'PRINTER_ERROR', message: error.message });
      setIsPrinting(false);
      setCurrentJob(null);
      setPrinterStatus("Error");
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: 'auto',
      background: 'linear-gradient(135deg, #f6f8fb 0%, #e9f0f8 100%)'
    }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Printer Simulator - Hub {HUB_ID}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '0 0 350px' }}>
          <VirtualPrinter 
            status={error ? 'Error' : printerStatus}
            isPrinting={isPrinting}
          />
        </Box>

        <Box sx={{ flex: '1 1 400px' }}>
          <StyledPaper elevation={3}>
            <Stack spacing={2}>
              <Typography variant="h6">
                Status: {error ? 'Error' : printerStatus}
              </Typography>
              
              {currentJob && !error && (
                <Box>
                  <Typography variant="body1">
                    Printing: {currentJob.files?.[0]?.fileName}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  action={
                    <Button color="inherit" onClick={resolveError}>
                      Resolve
                    </Button>
                  }
                >
                  {error.message}
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="body2">Toner Level</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={supplies.toner} 
                    color="primary"
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2">Paper Level</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={supplies.paper} 
                    color="secondary"
                  />
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={simulateError}
                >
                  Simulate Error
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setSupplies({ toner: 100, paper: 100 })}
                >
                  Refill Supplies
                </Button>
              </Stack>
            </Stack>
          </StyledPaper>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        <StyledPaper elevation={3} sx={{ flex: '1 1 300px', maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6">
            Print Queue ({printQueue.length} jobs)
          </Typography>
          <List>
            {printQueue.slice(0, 50).map((job) => (
              <ListItem 
                key={job.id}
                sx={{ 
                  borderBottom: '1px solid #eee',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                }}
              >
                <Stack direction="column" spacing={1} width="100%">
                  <Typography>
                    {job.files?.[0]?.fileName} - {job.files?.[0]?.pageCount} pages
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Job ID: {job.id.slice(0, 8)}...
                  </Typography>
                </Stack>
              </ListItem>
            ))}
            {printQueue.length > 50 && (
              <ListItem>
                <Typography color="textSecondary">
                  +{printQueue.length - 50} more jobs...
                </Typography>
              </ListItem>
            )}
          </List>
        </StyledPaper>

        <StyledPaper elevation={3} sx={{ flex: '1 1 300px' }}>
          <Typography variant="h6">Scheduled Jobs</Typography>
          <List>
            {scheduledJobs.map((job) => (
              <ListItem key={job.id}>
                <Typography>
                  {job.files?.[0]?.fileName} - Scheduled for {job.schedule?.date} {job.schedule?.time}
                </Typography>
              </ListItem>
            ))}
          </List>
        </StyledPaper>
      </Box>
    </div>
  );
};

export default PrinterSimulator;
