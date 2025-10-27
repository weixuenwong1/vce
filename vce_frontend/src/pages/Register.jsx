import '../App.css';
import { Box } from '@mui/material'
import FormTextField from '../forms/TextField'
import FormPassField from '../forms/PassField'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from '../utils/AxiosInstance'
import { useNavigate } from 'react-router-dom'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { useState } from 'react';
import Message from '../components/Message';

const Register = () => {

  const navigate = useNavigate()
  const [ShowMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const schema = yup
    .object({
      email: yup.string().email("Email is invalid").required("Email can't be blank"),
      password: yup.string()
        .required("Password can't be blank")
        .min(6, 'Password is too short (minimum 6 characters)')
        .matches(/[a-z]/, 'Password must contain at least one lower case letter')
        .matches(/[0-9]/, 'Password must contain at least one number'),
      school: yup.string().required("School can't be blank")
    })

  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) })

  const submission = async (data) => {
    try {
      const res = await AxiosInstance.post('register/', {
        email: data.email,
        password: data.password,
        school: data.school,
      });

      localStorage.removeItem('Token');
      localStorage.removeItem('TokenExpiry');

      localStorage.setItem('Token', res.data.token);
      localStorage.setItem('TokenExpiry', res.data.expiry);

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      if (error.response?.status === 400) {
        const errData = error.response.data;
        if (errData.email?.[0]?.includes("already exists")) {
          setErrorMessage("An account with this email already exists.");
        } else {
          setErrorMessage("Please ensure all fields are filled correctly.");
        }
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
      setShowMessage(true);
      console.error('Error during register', error);
    }
  };

  return (
    <div className="registerPage">
      {ShowMessage && <Message text={<span className="message-text">{errorMessage}</span>} color={"#FF5555"} />}
      <div className="gradient-bg-blue-reg" />
      <div className="gradient-bg-orange-reg" />
      <div className="registerContainer">
        <form onSubmit={handleSubmit(submission)}>
          <Box className={"regFormBox"}>
            <h1 className="auth-text-logo" onClick={() => navigate('/')}>
              Chuba
            </h1>
            <Box className={"regItemBox"}> 
              <Box className={"title"}> Sign Up Here </Box>
            </Box>
            <Box className={"regItemBox"}>
              <label htmlFor="email" className="customLabel">Email</label>
              <FormTextField name={"email"} label={"Email"} control={control} />
            </Box>
            <Box className={"regItemBox"}>
              <label htmlFor="school" className="customLabel">School</label>
              <FormTextField name={"school"} label={"School"} control={control} />
            </Box>
            <Box className={"regItemBox"}>
              <label htmlFor="password" className="customLabel">Password</label>
              <FormPassField name={"password"} label={"Password"} control={control} />
            </Box>
            <Box className={"itemBox"}>
              <p className="terms-text">
                By continuing, you agree to the <Link to="/terms-of-service">Terms and Conditions</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.
              </p>
            </Box>
            <Box className={"regItemBox"}>
              <button className="regButton" type={"submit"}>Sign Up</button>
            </Box>
            <Box className={"itemBox"}>
              <p className="have-account">
                Already have a Chuba account? <Link to="/login">Log in!</Link>
              </p>
            </Box>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default Register;