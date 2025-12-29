import '../App.css';
import { Box } from '@mui/material'
import {React, useState, useEffect} from 'react'
import FormTextField from '../forms/TextField'
import FormPassField from '../forms/PassField'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from '../utils/AxiosInstance'
import { useNavigate } from 'react-router-dom'
import Message from '../components/Message'
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import '../styles/Loader.scss'

const Login = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()
  const [ShowMessage, setShowMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.reason === "auth-required") {
      toast.error("Please log in to continue", { toastId: "auth-required-login" });

      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);


  const submission = async (data) => {
    setLoading(true);
    setShowMessage(false);

    try {
      const res = await AxiosInstance.post('login/', {
        email: data.email,
        password: data.password,
      });

      localStorage.removeItem('Token');
      localStorage.removeItem('TokenExpiry');

      localStorage.setItem('Token', res.data.token);
      localStorage.setItem('TokenExpiry', res.data.expiry); 

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("We couldn’t find an account with the email and password you entered. Please double-check your details and try again.");
      } else if (error.response?.status === 400) {
        setErrorMessage("Please ensure all fields are filled correctly.");
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
      setShowMessage(true);
      // console.error('Error during login', error);
    } finally {
    setLoading(false);
  }
  };

  return (
    <div className="loginPage">
      {ShowMessage && (
        <div id="topErrorBar" className="globalAlert" role="alert" aria-live="polite">
          <Message text={<span className="message-text">{errorMessage}</span>} color="#FF5555" />
        </div>
      )}
      <div className="gradient-bg-blue" />
      <div className="gradient-bg-orange" />
      <div className="loginContainer">
        <form onSubmit={handleSubmit(submission)}>
          <Box className ={"formBox"}>
            <h1 className="auth-text-logo-login" onClick={() => navigate('/')}>
              Chuba
            </h1>
            <Box className={"itemBox"}>
              <Box className={"title"}> Login Here </Box>
            </Box>
            <Box className={"itemBox"}> 
              <label htmlFor="email" className="customLabel">Email</label>
              <FormTextField name={"email"} control={control} id="email" label="Email"/>
            </Box> 
            <Box className={"itemBox"}>
              <label htmlFor="password" className="customLabel">Password</label>
              <FormPassField name={"password"} control={control} id="password" label="Password" />
            </Box>
            <Box className={"itemBox"} style={{ height: 'auto', marginTop: '10px' }}>
              <Link to="/request/password_reset" className="forgotPasswordLink">
                Forgot password?
              </Link>
            </Box>
            <Box className={"itemBox"}>
              <button
                className="regButton"
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="loader2 loader2--btn" /> : "Log In"}
              </button>
            </Box>
            <Box className={"itemBox"}>
              <p>
                Need a Chuba account? <Link to="/register">Create account!</Link>
              </p>
            </Box>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default Login;