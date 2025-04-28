import * as React from 'react';
import {FormControl, InputLabel, OutlinedInput, FormHelperText} from '@mui/material';
import '../../App.css'
import { Controller } from 'react-hook-form'

export default function FormTextField(props) {
  const {label, name, control} = props
  return (
    <Controller 
      name={name}
      control={control}
      defaultValue=""
      render={({
        field: { onChange, value },
        fieldState: { error }
      }) => (
        <FormControl variant="outlined" className="myForm" error={!!error}>
          <InputLabel htmlFor={name}>{label}</InputLabel>
          <OutlinedInput
            id={name}
            value={value}
            onChange={onChange}
            label={label}
            className="myInput"
          />
          <FormHelperText sx={{color: "#ff5555", mt: 1}} >{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}