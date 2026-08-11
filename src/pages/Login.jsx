import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setToken } from '../helpers/api';
import { toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const { data } = await api.post('/login', { username, password });
      setToken(data.token);
      navigate('/admin');
    } catch (error) {
      toast.error('Usuario o contraseña incorrectos', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-10'>
      <h2 className='text-center uppercase font-bold'>Ingresar</h2>
      <form onSubmit={handleLogin} className='flex flex-col items-center gap-10 w-full'>
        <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-3/12">
          <input
            type="text"
            placeholder="Usuario"
            className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-3/12">
          <input
            type="password"
            placeholder="Contraseña"
            className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className='w-6/12 rounded-md font-bold text-white uppercase p-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 xl:w-2/12 disabled:opacity-60'
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
