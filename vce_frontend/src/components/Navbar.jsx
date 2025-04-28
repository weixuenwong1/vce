import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { Link, useLocation } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate()

  const logoutUser = () => {
    AxiosInstance.post(`logoutall/`,{
    })
    .then(() => {
      localStorage.removeItem('Token')
      setTimeout(()=>{
        navigate('/login')
      } , 1000)
    })
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              to="/chapters"
              style={{
                textDecoration: 'none',
                color: path === '/chapters' ? 'yellow' : 'white',
              }}
            >
              <Button sx={{ color: 'inherit' }}>Chapters</Button>
            </Link>

            <Link
              to="/practice"
              style={{
                textDecoration: 'none',
                color: path === '/practice' ? 'yellow' : 'white',
              }}
            >
              <Button sx={{ color: 'inherit' }}>Practice</Button>
            </Link>

            <Button
              onClick= {logoutUser}
              sx={{ color: 'inherit' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
