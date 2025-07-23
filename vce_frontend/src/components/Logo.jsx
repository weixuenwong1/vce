import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

const Logo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const logoUrl = "https://vceproblems.s3.ap-southeast-2.amazonaws.com/chuba_static_images/LogoTransparent.png";

    const path = location.pathname;
    const isLogin = path === '/login';
    const isRegister = path === '/register';

    const logoClass = isLogin ? "logo-login" : isRegister ? "logo-register" : "logo-top-left";

    return (
        <div>
            <img 
                src={logoUrl} 
                alt="Chuba Logo" 
                className={logoClass}
                onClick={() => navigate('/')} 
            />
        </div>
    );
};

export default Logo;
