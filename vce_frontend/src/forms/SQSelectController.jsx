import { Controller } from 'react-hook-form';
import { FormControl, Select, MenuItem, FormHelperText, Typography } from '@mui/material';
import { useRef } from 'react';

const colors = {
  text: '#000000',
  fieldBg: '#fff',
  border: '#e43a3a',
  focus: '#ffb347',
  label: '#fff',
  menuBg: '#fff',
  menuHover: '#ff6f4375',
  error: '#c62828',
};

export default function SQSelectController({
  name,
  control,
  label,
  options = [],
  disabled = false,
  defaultValue = '',
}) {
  const triggerRef = useRef(null); 
  

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          variant="outlined"
          sx={{ width: '100%', mb: 2 }}
          error={!!error}
          disabled={disabled}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: colors.label,
              fontWeight: 700,
              mb: 1,
              fontFamily: 'Courier New',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
            }}
          >
            {label}
          </Typography>

          <Select
            inputRef={triggerRef}
            {...field}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: colors.text }}>Select an option…</span>;
              }
              return options.find((opt) => opt.value === selected)?.label;
            }}
            sx={{
              bgcolor: colors.fieldBg,
              color: colors.text,
              fontFamily: 'Courier New',
              fontWeight: 600,
              letterSpacing: '0.2px',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
              borderRadius: '4px',
              '.MuiOutlinedInput-notchedOutline': { borderColor: colors.border, borderWidth: 2 },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.focus },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.focus },
              '.MuiSvgIcon-root': { fill: 'black !important' },

              '& .MuiSelect-select': {
                paddingTop: { xs: '12px', sm: '14px', md: '15px' },
                paddingBottom: { xs: '12px', sm: '14px', md: '15px' },
                paddingLeft: { xs: '10px', sm: '12px', md: '18px' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              keepMounted: false,
              disablePortal: false,
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              TransitionProps: {
                onExited: () => triggerRef.current?.focus(),
              },
              PaperProps: {
                sx: {
                  bgcolor: colors.menuBg,
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  boxShadow: `0 0 0 2px ${colors.focus}`,
                  maxHeight: { xs: 280, sm: 360, md: 420 },
                  width: 'auto',
                  mt: 0.5,
                  maxWidth: { xs: '68vw', sm: '520px', md: '640px' },
                  overflowY: 'auto',
                  '.MuiList-root': { paddingTop: 0, paddingBottom: 0 },
                  '.MuiMenuItem-root': {
                    color: colors.text,
                    fontFamily: 'Courier New',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                    minHeight: 'unset',
                    paddingTop: { xs: '6px', sm: '10px', md: '14px' },
                    paddingBottom: { xs: '6px', sm: '10px', md: '14px' },
                    paddingLeft: { xs: '10px', sm: '12px', md: '14px' },
                    paddingRight: { xs: '10px', sm: '12px', md: '14px' },

                    display: 'block',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '&.Mui-selected': { bgcolor: colors.menuHover },
                    '&.Mui-selected.Mui-focusVisible:not(:hover)': { bgcolor: 'transparent' },
                    '&.Mui-focusVisible:not(:hover)': { bgcolor: 'transparent' },
                    '&.Mui-selected:hover, &:hover, &.Mui-focusVisible:hover': {
                      bgcolor: colors.menuHover,
                    },
                  },
                },
              },
            }}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>

          <FormHelperText sx={{ color: colors.error, mt: 1 }}>
            {error?.message}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}
