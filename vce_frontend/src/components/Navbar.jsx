import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate, useLocation } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;


  const isLoggedIn = Boolean(localStorage.getItem('Token'));

  const [anchorChapters, setAnchorChapters] = React.useState(null);
  const [anchorPractice, setAnchorPractice] = React.useState(null);

  const openChapters = Boolean(anchorChapters);
  const openPractice = Boolean(anchorPractice);

  const handleOpenMenu = (setter) => (event) => setter(event.currentTarget);
  const handleCloseMenu = (setter) => () => setter(null);

  const handleMenuSelect = (basePath, subject, closeFn) => {
    closeFn();
    navigate(`/${basePath}/${subject}`);
  };

  const logoutUser = () => {
    AxiosInstance.post(`logout/`).then(() => {
      localStorage.removeItem('Token');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    });
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', gap: 2 }}>

            <Button
              sx={{ color: path.includes('/chapters') ? 'yellow' : 'white' }}
              onClick={handleOpenMenu(setAnchorChapters)}
            >
              Chapters
            </Button>
            <Menu
              anchorEl={anchorChapters}
              open={openChapters}
              onClose={handleCloseMenu(setAnchorChapters)}
            >
              <MenuItem onClick={() => handleMenuSelect('chapters', 'physics', () => setAnchorChapters(null))}>Physics</MenuItem>
              <MenuItem onClick={() => handleMenuSelect('chapters', 'chemistry', () => setAnchorChapters(null))}>Chemistry</MenuItem>
              <MenuItem onClick={() => handleMenuSelect('chapters', 'biology', () => setAnchorChapters(null))}>Biology</MenuItem>
            </Menu>

            {/* Practice Dropdown */}
            <Button
              sx={{ color: path.includes('/practice') ? 'yellow' : 'white' }}
              onClick={handleOpenMenu(setAnchorPractice)}
            >
              Practice
            </Button>
            <Menu
              anchorEl={anchorPractice}
              open={openPractice}
              onClose={handleCloseMenu(setAnchorPractice)}
            >
              <MenuItem onClick={() => handleMenuSelect('practice', 'physics', () => setAnchorPractice(null))}>Physics</MenuItem>
              <MenuItem onClick={() => handleMenuSelect('practice', 'chemistry', () => setAnchorPractice(null))}>Chemistry</MenuItem>
              <MenuItem onClick={() => handleMenuSelect('practice', 'biology', () => setAnchorPractice(null))}>Biology</MenuItem>
            </Menu>

            {isLoggedIn && (
              <Button onClick={logoutUser} sx={{ color: 'inherit' }}>
                Logout
              </Button>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;