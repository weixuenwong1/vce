import '../App.css';
import { Box } from '@mui/material'
import {React, useState} from 'react'
import FormTextField from './forms/TextField'
import FormPassField from './forms/PassField'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock';
import Message from './Message';


const PasswordResetRequest = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()

  const [ShowMessage, setShowMessage] = useState(false)

  const submission = (data) => {
    AxiosInstance.post('api/password_reset/', {
      email: data.email,
    })

    .then((response) => {
      setShowMessage(true)
    })

  }
    return (
        <div style={{ position: 'relative', 
                      minHeight: '100vh', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#071c39',
                      overflow: 'hidden',
                    }}>
          {ShowMessage ? <Message text={"If this email address was used to create an account, instructions to reset your password will be sent to your email."}/> : null}
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
              <Box
                sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                }}
                >
                    <LockIcon sx={{ fontSize: 50, color: 'white' }} />
                </Box>
                  <Box className={"itemBox"}>
                      <Box className={"title"}> Forgot Password? </Box>
                  </Box>
                  <Box className={"itemBox"} style={{ alignItems: 'center' }}>
                      <p style={{ textAlign: 'left', maxWidth: '100%' }}>
                        Enter the email address you used when you joined and we'll send you instructions to reset your password.
                      </p>
                  </Box>
                  <Box className={"itemBox"}>
                      <label htmlFor="email" className="customLabel">Email</label>
                      <FormTextField name={"email"} control={control} id="email" label="Email"/>
                  </Box>
                  <Box className={"itemBox"}>
                      <button type={"submit"}>Reset Password</button>
                  </Box>
                  <Box className={"itemBox"}>
                  </Box>
              </Box>
            </form>
          </div>
        </div>
    );
}

export default PasswordResetRequest