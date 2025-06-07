import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function FormPassField(props) {
  const [showPassword, setShowPassword] = React.useState(false);
  const {label, name, control} = props;

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  return (
      <Controller 
        name = {name}
        control = {control}
        defaultValue=""
        render = {({
          field: {onChange, value},
          fieldState: {error},
          formState,
        }) =>(
          <FormControl variant="outlined" className={"myForm"}>
          <InputLabel htmlFor={`outlined-adornment-${name}`}>{label}</InputLabel>
          <OutlinedInput
            id={`outlined-adornment-${name}`}
            onChange={onChange}
            value={value}
            type={showPassword ? 'text' : 'password'}
            error={!!error}
            className={"myInput"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={
                    showPassword ? 'hide the password' : 'display the password'
                  }
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  onMouseUp={handleMouseUpPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label={label}
          />
          <FormHelperText sx={{color: "#ff5555", mt: 1}}> {error?.message} </FormHelperText>
        </FormControl>
        )
      }
      />
        
  );
}
