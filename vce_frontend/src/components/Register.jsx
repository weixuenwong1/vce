import '../App.css';
import { Box } from '@mui/material'
import FormTextField from './forms/TextField'
import FormPassField from './forms/PassField'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"

const Register = () => {
  const navigate = useNavigate()

  const schema = yup
  .object({
      email: yup.string().email("Email is invalid").required("Email can't be blank"),
      password: yup.string()
                  .required("Password can't be blank")
                  .min(6, 'Password is too short (minimum 6 characters)')
                  .matches(/[a-z]/, 'Password must contain at least one lower case letter')
                  .matches(/[0-9]/, 'Password must contain at least one number'),
      school: yup.string().required("School can't be blank"),
      password2: yup.string().required("Password confirmation can't be blank")
                  .oneOf([yup.ref('password'), null], 'Passwords must match')
  })

  const {handleSubmit, control} = useForm({resolver: yupResolver(schema)})

  const submission = (data) => {
    AxiosInstance.post('register/', {
      email: data.email,
      password: data.password,
      school: data.school, 
    })
    .then(() => {
      navigate(`/login`)
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
      <div className="gradient-bg-blue-reg"/>
      <div className="gradient-bg-orange-reg"/>
      <div style={{
        position: 'relative',
        zIndex: 1,
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <form onSubmit={handleSubmit(submission)}>
          <Box className ={"regFormBox"}>
              <Box className={"itemBox"}>
                  <Box className={"title"}> Sign Up Here </Box>
              </Box>
              <Box className={"itemBox"}>
                  <label htmlFor="email" className="customLabel">Email</label>
                  <FormTextField name={"email"} label={"Email"} control={control}/>
              </Box>
              <Box className={"itemBox"}>
                  <label htmlFor="school" className="customLabel">School</label>
                  <FormTextField name={"school"} label={"School"} control={control}/>
              </Box>
              <Box className={"itemBox"}>
                  <label htmlFor="password" className="customLabel">Password</label>
                  <FormPassField name={"password"} label={"Password"} control={control}/>
              </Box>
              <Box className={"itemBox"}>
                  <label htmlFor="password2" className="customLabel">Confirm Password</label>
                  <FormPassField name={"password2"} label={"Confirm Password"} control ={control}/>
              </Box>
              <Box className={"itemBox"}>
                <button type={"submit"}>Sign Up</button>
              </Box>
              <Box className={"itemBox"}>
                  <p>
                      Already have an Chuba account? <Link to="/login">Log in!</Link>
                  </p>
              </Box>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default Register;