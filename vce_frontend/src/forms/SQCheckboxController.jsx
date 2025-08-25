import { Controller } from 'react-hook-form';
import { Checkbox, FormControlLabel, FormControl, FormHelperText } from '@mui/material';

const colors = {
  text: '#fff',
  accent: '#ff6b6b', // coral
  error: '#c62828',
  label: '#fff',
};

export default function SQCheckboxController({
  name, control, label, defaultValue = false,
}) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, onChange, ref }, fieldState: { error } }) => (
        <FormControl error={!!error} component="fieldset" sx={{ width: 'auto', mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                ref={ref}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                sx={{
                  color: colors.accent,
                  '&.Mui-checked': { color: colors.accent },
                }}
              />
            }
            label={label}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontFamily: '"Courier New", monospace',
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                fontWeight: 700,
                color: colors.label,
              },
            }}
          />
          <FormHelperText sx={{ color: colors.error, mt: 1 }}>{error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}