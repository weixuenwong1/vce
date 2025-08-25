import { Controller } from 'react-hook-form';
import { FormControl, OutlinedInput, FormHelperText } from '@mui/material';

const colors = {
  text: '#000000',
  fieldBg: '#fff',
  border: '#e43a3a',
  focus: '#ffb347',
  label: '#fff',
  error: '#c62828',
};

export default function SQTextareaController({
  name,
  control,
  label,                 
  placeholder,           
  rows = 6,
  defaultValue = '',
}) {
  const ph = placeholder ?? label ?? '';

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <FormControl variant="outlined" sx={{ width: '100%', mb: 2, mt: 5 }} error={!!error}>
          <OutlinedInput
            {...field}
            placeholder={ph}
            multiline
            minRows={rows}
            sx={{
              bgcolor: colors.fieldBg,
              color: colors.text,
              fontFamily: 'Courier New',
              fontWeight: 600,
              letterSpacing: '0.2px',
              fontSize: { xs: '0.9rem', sm: '1.0rem', md: '1.1rem' },
              borderRadius: '4px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border,
                borderWidth: 2,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.focus,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.focus,
              },
              '& input::placeholder, & textarea::placeholder': {
                color: '#444',
                opacity: 1,
                whiteSpace: 'pre-line',   
              },
              '& textarea': {
                resize: 'none',
                overflow: 'auto',
                lineHeight: 1.35,
                whiteSpace: 'pre-wrap',
              },
            }}
          />
          <FormHelperText sx={{ color: colors.error, mt: 1 }}>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}
