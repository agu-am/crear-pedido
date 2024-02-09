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
      <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit">Add User</button>
      </form>
  );
}

export default NuevoCliente