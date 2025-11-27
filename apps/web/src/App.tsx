import React from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, Outlet } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <ButtonBase 
        onClick={() => { navigate('/', { replace: true }); }} 
        sx={{
          position: 'absolute',
          top: 28,
          left: 32,
          height: '48px',
          width: '48px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          }
        }}
      >
        <HomeIcon sx={{ color: '#ffffff', fontSize: 24 }} />
      </ButtonBase>
      <Outlet />
    </div>
  );
}

export default App;
