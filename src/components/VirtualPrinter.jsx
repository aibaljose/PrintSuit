import React from 'react';
import { Box, styled, keyframes } from '@mui/material';

const printAnimation = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  20% { transform: translateY(0); opacity: 1; }
  80% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const paperFeedAnimation = keyframes`
  0% { height: 0; }
  100% { height: 80px; }
`;

const PrinterContainer = styled(Box)(({ theme }) => ({
  width: '300px',
  height: '200px',
  position: 'relative',
  backgroundColor: '#2c3e50',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '40px',
    left: '20px',
    right: '20px',
    height: '2px',
    backgroundColor: '#34495e',
  }
}));

const PaperSlot = styled(Box)({
  position: 'absolute',
  top: '42px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '180px',
  height: '4px',
  backgroundColor: '#34495e',
  borderRadius: '2px',
});

const Paper = styled(Box)(({ isPrinting }) => ({
  position: 'absolute',
  top: '44px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '160px',
  backgroundColor: 'white',
  display: isPrinting ? 'block' : 'none',
  animation: `${paperFeedAnimation} 2s ease-out`,
}));

const StatusLight = styled(Box)(({ isActive }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: isActive ? '#2ecc71' : '#e74c3c',
  boxShadow: isActive ? '0 0 10px #2ecc71' : 'none',
  transition: 'all 0.3s ease',
}));

const VirtualPrinter = ({ status, isPrinting }) => {
  return (
    <PrinterContainer>
      <StatusLight isActive={status === 'Ready' || isPrinting} />
      <PaperSlot />
      {isPrinting && <Paper isPrinting />}
    </PrinterContainer>
  );
};

export default VirtualPrinter;
