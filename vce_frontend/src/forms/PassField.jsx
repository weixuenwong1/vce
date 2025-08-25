import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function FormPassField({ label, name, control, className }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShow = () => setShowPassword(s => !s);

  const autoComplete =
    name?.toLowerCase().includes('confirm') ? 'new-password' :
    name?.toLowerCase().includes('password') ? 'new-password' :
    undefined;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl variant="outlined" className={`myForm ${className || ''}`} error={!!error}>
          <OutlinedInput
            id={name}
            name={name}
            onChange={onChange}
            value={value}
            type={showPassword ? 'text' : 'password'}
            error={!!error}
            autoComplete={autoComplete}
            placeholder={label}
            inputProps={{
              autoCapitalize: 'none',
              autoCorrect: 'off',
              spellCheck: 'false',
              inputMode: 'text',
            }}
            sx={{
              color: 'black',
              fontFamily: 'Courier New',
              fontWeight: 600,
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

              '& input': {
                WebkitTapHighlightColor: 'transparent',
                WebkitAppearance: 'none',
                outline: 'none',
              },
              '& input:focus': { outline: 'none' },

              '& .MuiIconButton-root': { outline: 'none' },
              '& .MuiIconButton-root:focus': { outline: 'none' },
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={toggleShow}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseUp={(e) => e.preventDefault()}
                  edge="end"
                  disableRipple
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <FormHelperText
            sx={{ color: '#ff5555', mt: 0.355, lineHeight: 1, fontSize: '0.75rem' }}
          >
            {error?.message}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}