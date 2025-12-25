import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = { email, password };
      if (require2FA) {
        payload.twoFactorCode = twoFactorCode;
      }

      const res = await api.post('/auth/login', payload);

      if (res.data.require2FA) {
        setRequire2FA(true);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Admin Gate URL'ine yönlendir (Eğer admin ise)
      // Not: Kullanıcı admin olsa bile, doğru URL'i bilmiyorsa 404 alır.
      // Bu yüzden burayı sadece '/' veya dashboard'a yönlendirebiliriz.
      // Ancak kullanıcı deneyimi için ana sayfaya atalım.
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      // Eğer 2FA kodu yanlışsa, inputu temizle
      if (require2FA) setTwoFactorCode('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">Login</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!require2FA ? (
          <>
            <div>
              <label className="block text-gray-700">Email</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input 
                type="password" 
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-gray-700 font-bold">Two-Factor Authentication Code</label>
            <p className="text-sm text-gray-500 mb-2">Please enter the code from your authenticator app.</p>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 text-center text-xl tracking-widest"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="000000"
              required
              autoFocus
            />
          </div>
        )}
        
        <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition">
          {require2FA ? 'Verify & Login' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
