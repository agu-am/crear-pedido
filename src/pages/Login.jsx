import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        const data = {
            username,
            password,
        };

        axios.post('https://pedidosprueba.agustinjs.com/wp-json/jwt-auth/v1/token', data)
            .then((response) => {
                // Autenticación exitosa, guarda el token si es necesario
                const { data } = response
                setToken(data.token)
                navigate('/ordenes');
            })
            .catch((error) => {
                // Maneja errores de autenticación
            });
    };

    return (
        <div className='h-screen flex flex-col items-center justify-center gap-10'>
            <h2 className='text-center uppercase font-bold'>Ingresar2</h2>
            <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                <input
                    type="text"
                    placeholder="Usuario"
                    className="flex bg-white text-xl text-black rounded border-white pt-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                <input
                    type="password"
                    placeholder="Contraseña"
                    className="flex bg-white text-xl text-black rounded border-white pt-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button
                className='w-6/12 rounded-md font-bold text-white uppercase p-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600'
                onClick={handleLogin}>Ingresar</button>
        </div>
    )
}

export default Login