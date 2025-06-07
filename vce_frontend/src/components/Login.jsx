import '../App.css';
import { Box } from '@mui/material'
import {React, useState} from 'react'
import FormTextField from './forms/TextField'
import FormPassField from './forms/PassField'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import Message from './Message'

const Login = () => {
  const navigate = useNavigate()
  const {handleSubmit, control} = useForm()
  const [ShowMessage, setShowMessage] = useState(false)

  const submission = (data) => {
    AxiosInstance.post('login/', {
      email: data.email,
      password: data.password,
    })
    .then((response) => {
      localStorage.setItem('Token', response.data.token)
      navigate(`/`)
    })
    .catch((error) => {
      setShowMessage(true)
      console.error('Error during login', error)
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
      {ShowMessage ? <Message text={"We couldn’t find an account with the email and password you entered. Please double-check your details and try again."} color={"#FF5555"}/> : null}
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
                  <button type={"submit"}>Log In</button>
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