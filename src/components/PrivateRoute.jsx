import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
  
    useEffect(() => {
      if (!token) {
        navigate('/login');
      }
    }, [token, navigate]);
  
    return token ? children : null;
  };

  export default PrivateRoute