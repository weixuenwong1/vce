import * as React from 'react';
import { FormControl, OutlinedInput, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';
import '../App.css';

export default function FormTextField(props) {
  const { label, name, control, className } = props;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl
          variant="outlined"
          className={`myForm ${className || ''}`}
          error={!!error}
        >
          <OutlinedInput
            id={name}
            value={value}
            onChange={onChange}
            placeholder={label}
            sx={{
              color: 'black',
              fontFamily: 'Courier New',
              fontWeight: 700,
              letterSpacing: '0.2px',
              fontSize: { xs: '1rem', sm: '1rem', md: '1.1rem' },

              '& .MuiOutlinedInput-input': {
                padding: { xs: '12px 12px', sm: '12px 14px', md: '14px 16px' },
                caretColor: '#0000009c',
              },

              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--sq-hover, #FF7043)',
              },

              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--sq-focus, #FF7043)',
                borderWidth: '2px',
              },

              // misc input tweaks
              '& input': {
                WebkitTapHighlightColor: 'transparent',
                WebkitAppearance: 'none',
                outline: 'none',
              },
              '& input:focus': {
                outline: 'none',
              },
            }}
          />
          <FormHelperText
            sx={{
              color: '#ff5555',
              mt: 0.355,
              lineHeight: 1,
              fontSize: '0.75rem',
            }}
          >
            {error?.message}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}
