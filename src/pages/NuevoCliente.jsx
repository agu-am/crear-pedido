import axios from "axios";
import { useState } from "react";

const NuevoCliente = () => {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const predefinedPassword = 'Bplmcfc10';
    const token = localStorage.getItem('token');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            username: username,
            password: predefinedPassword,
            email: email,
            roles: ['customer'] // Asegúrate de que el rol "customer" existe en tu instalación de WordPress
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const response = await axios.post('https://pedidosprueba.agustinjs.com/wp-json/wp/v2/users', data, config);
            console.log('User added successfully', response.data);
        } catch (error) {
            console.error('Error adding user', error);
            console.error(error.response.data.message);
        }
    }

    return (
        <div className="flex justify-center items-center w-full h-[calc(100vh-64px)]">
            <form
                className="flex flex-col gap-2 items-center justify-center xl:w-4/12 h-2/4"
                onSubmit={handleSubmit}
            >
                <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                    <input
                        className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-2 self-center bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded pb-1 xl:w-6/12">
                    <input
                        className="flex w-full bg-white text-xl text-black rounded border-white pt-2"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button
                    className='w-full rounded-md font-bold text-white uppercase p-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 xl:w-6/12'
                    type="submit"
                >
                    Agregar Cliente
                </button>
            </form>
        </div>
    );
}

export default NuevoCliente