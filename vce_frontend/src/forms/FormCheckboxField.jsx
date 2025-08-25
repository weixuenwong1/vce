import * as React from 'react';
import { Controller } from 'react-hook-form';
import { Checkbox, FormControlLabel, FormControl, FormHelperText } from '@mui/material';

export default function FormCheckboxField({ name, control, label, defaultValue = false }) {
  const inputId = `${name}-checkbox`;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, onChange, ref }, fieldState: { error } }) => (
        <FormControl error={!!error} component="fieldset" sx={{ width: 'auto' }}>
          <FormControlLabel
            control={
              <Checkbox
                ref={ref}
                id={inputId}
                name={name}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                slotProps={{
                    input: { 'aria-label': 'Agree to the Terms of Service' }
                }}
              />
            }
            label={label}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: '"Courier New", monospace',
                fontSize: { xs: '0.7rem', sm: '0.85rem', md: '0.95rem' },
              },
            }}
          />
          <FormHelperText sx={{ '&.MuiFormHelperText-root.Mui-error': { color: '#ff5555' }, mt: 1 }}>
            {error?.message}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}