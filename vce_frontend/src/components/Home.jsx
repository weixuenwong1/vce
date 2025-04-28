import AxiosInstance from "./AxiosInstance"
import {React, useEffect, useState} from 'react'
import {Box} from '@mui/material'

const Home = () => {

    const [myData, setMyData] = useState()
    const [loading, setLoading] = useState(true)

    const GetData = () => {
        AxiosInstance.get(`users/`).then((res) => {
            setMyData(res.data)
            setLoading(false)
        })
    }

    useEffect(() => {
        GetData();
    }, [])
    return(
        <div>
            { loading ? <p>Loading...</p> :
            <div>
                {myData.map((item, index) => (
                    <Box key={index} sx={{p:2, m:2, boxShadow: 3}}>
                        <div>ID: {item.id}</div>
                        <div>email: {item.email}</div>
                    </Box>
                ))}
            </div>
            } 
        </div>
    )
}

export default Home