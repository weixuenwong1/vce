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


const PasswordReset = () => {
  const navigate = useNavigate()
  const {token} = useParams()
  const [ShowMessage, setShowMessage] = useState(false)

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

  const submission = (data) => {
    AxiosInstance.post('api/password_reset/confirm/', {
      password: data.password,
      token: token,
    })

    .then((response) => {
      setShowMessage(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    })

  }
    return (
        <div style={{ position: 'relative', 
                      minHeight: '100vh', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#2E2E2E',
                      overflow: 'hidden',
                    }}>
          {ShowMessage ? <Message text={"Your password has been successfully reset. You can now log in with your new password."} color={"black"}/> : null}
          <div className="gradient-bg-blue" />
          <div className="gradient-bg-orange" />
          <div style={{
            position: 'relative',
            zIndex: 1,
            color: 'white',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <form onSubmit={handleSubmit(submission)}>
              <Box className ={"formBox"}>
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
                      <button className="regButton"  type={"submit"}>Reset Password</button>
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