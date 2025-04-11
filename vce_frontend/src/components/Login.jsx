import '../App.css';
import { Box } from '@mui/material'
import FormTextField from './forms/TextField'
import FormPassField from './forms/PassField';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ position: 'relative', 
                  minHeight: '100vh', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center' 
                }}>
      <div className="gradient-bg-blue" />
      <div className="gradient-bg-orange" />
      <div style={{
        position: 'relative',
        zIndex: 1,
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Box className ={"formBox"}>
            <Box className={"itemBox"}>
                <Box className={"title"}> Login Here </Box>
            </Box>
            <Box className={"itemBox"}>
                <label htmlFor="email" className="customLabel">Email</label>
                <FormTextField id="email" label="Email"/>
            </Box>
            <Box className={"itemBox"}>
                <label htmlFor="password" className="customLabel">Password</label>
                <FormPassField id="password" label="Password" />
            </Box>
            <Box className={"itemBox"}>
                <button>Log In</button>
            </Box>
            <Box className={"itemBox"}>
                <p>
                    Need an Expliqa account? <Link to="/register">Create account!</Link>
                </p>
            </Box>
        </Box>
      </div>
    </div>
  );
};

export default Login;