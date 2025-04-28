import '../App.css';
import { Box } from '@mui/material'
import {React, useState} from 'react'
import FormPassField from './forms/PassField'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock';
import Message from './Message';


const PasswordReset = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()
  const {token} = useParams()
  const [ShowMessage, setShowMessage] = useState(false)

  const submission = (data) => {
    AxiosInstance.post('api/password_reset/confirm/', {
      password: data.password,
      token: token,
    })

    .then((response) => {
      setShowMessage(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
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
          {ShowMessage ? <Message text={"Your password has been successfully reset. You can now log in with your new password."}/> : null}
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
                      <Box className={"title"}> Reset Password </Box>
                  </Box>
                  <Box className={"itemBox"}>
                    <label htmlFor="password" className="customLabel">Password</label>
                    <FormPassField name={"password"} control={control} label="Password" />
                  </Box>
                  <Box className={"itemBox"}>
                    <label htmlFor="confirmPassword" className="customLabel">Confirm Password</label>
                    <FormPassField name={"password2"} control={control} label="Confirm Password" />
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

export default PasswordReset