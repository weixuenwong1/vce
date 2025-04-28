import { Box } from "@mui/material"

const Message = ({text}) => {
    return(
        <Box
        sx={{
            backgroundColor: 'black',
            fontFamily: 'Poppins',
            color: '#ffffff',
            width: '100%',
            padding: '10px 20px',
            position: 'absolute',
            top: 0,
            left: 0,
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            boxSizing: 'border-box',
        }}
        >
      {text}
    </Box>
    )
}

export default Message