import '../App.css';
import { Box } from '@mui/material'
import {React, useState} from 'react'
import FormPassField from '../forms/PassField';
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from '../utils/AxiosInstance'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react';
import Message from '../components/Message';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import '../styles/Loader.scss'


const PasswordReset = () => {
  const navigate = useNavigate()
  const {token} = useParams()
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPasswordSchema = yup.object({
    password: yup.string()
      .required("Password can't be blank")
      .min(6, 'Password must be at least 6 characters')
      .matches(/[a-z]/, 'Password must include at least one lowercase letter')
      .matches(/[0-9]/, 'Password must include at least one number'),
    
    password2: yup.string()
      .required("Please confirm your password")
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
  });

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const submission = async (data) => {
    setLoading(true);

    try {
      await AxiosInstance.post('api/password_reset/confirm/', {
        password: data.password,
        token: token,
      });

      setShowError(false);
      setErrorMessage('');
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (error) {
      // console.log(error);

      let msg = 'Something went wrong. Please try again.';

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (Array.isArray(data.password) && data.password.length > 0) {
          msg = data.password[0];
        } else if (Array.isArray(data.token) && data.token.length > 0) {
          msg = "This reset link has expired or is no longer valid. Please request a new one.";
        } else if (typeof data.detail === 'string') {
          msg = "An unexpected error occurred. Please try again, and contact us if the issue continues.";
        }
      } else if (error.message === 'Network Error') {
        msg = 'Network error. Please check your connection and try again.';
      }

      setErrorMessage(msg);
      setShowError(true);
      setShowSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="passwordResetRequestPage">
      {showError && (
        <div id="topErrorBar" className="globalAlert" role="alert" aria-live="polite">
          <Message text={<span className="message-text">{errorMessage}</span>} color="#FF5555"/>
        </div>
      )}
      {showSuccess && (
        <Message text={'Your password has been successfully reset. You can now log in with your new password.'} color="black"/>
      )}
      <div className="gradient-bg-blue" />
      <div className="gradient-bg-orange" />
      <div className="passwordResetRequestContainer">
        <form onSubmit={handleSubmit(submission)}>
          <Box className ={"passwordFormBox"}>
              <Box className={"itemBox"}>
                <Box className="key-circle">
                  <KeyRound size={50} color="white" />
                </Box> 
                  <Box className={"reset-password-title"}> Reset Password </Box>
              </Box>
              <p className="instruction-text">Enter a new password</p>
              <Box className={"itemBox"}>
                <label htmlFor="password" className="customLabel">Password</label>
                <FormPassField name={"password"} control={control} label="Password" />
              </Box>
              <Box className={"itemBox"}>
                <label htmlFor="confirmPassword" className="customLabel">Confirm Password</label>
                <FormPassField name={"password2"} control={control} label="Confirm Password" />
              </Box>
              <Box className={"itemBox"}>
                <button
                  className="passwordRegButton"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <span className="loader2 loader2--btn loader2--btn-blue" /> : "Reset Password"}
                </button>
              </Box>
              <Box className={"itemBox"}>
              </Box>
          </Box>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset