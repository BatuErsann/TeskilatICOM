import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: email, 2: code + new password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Send code to email
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('Doğrulama kodu e-posta adresinize gönderildi.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify code and set new password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/reset-password', {
                email,
                code,
                newPassword
            });
            setMessage(res.data.message || 'Şifreniz başarıyla güncellendi!');

            // Redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Geçersiz veya süresi dolmuş kod.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-center mb-6">
                <img src="/logo.svg" alt="Teşkilat ICOM" className="h-20 w-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center text-primary">
                {step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
            </h2>

            {step === 1 && (
                <p className="text-gray-500 text-sm text-center mb-6">
                    E-posta adresinizi girin, size doğrulama kodu göndereceğiz.
                </p>
            )}

            {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-4 text-center text-sm">
                    {message}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">E-posta Adresi</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition disabled:opacity-50"
                    >
                        {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Doğrulama Kodu</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900 text-center text-2xl tracking-[0.5em] font-bold"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                        />
                        <p className="text-gray-400 text-xs mt-1 text-center">E-postanıza gelen 6 haneli kodu girin</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Yeni Şifre</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">Şifre Tekrar</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent text-gray-900"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifrenizi tekrar girin"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition disabled:opacity-50"
                    >
                        {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep(1); setCode(''); setError(''); setMessage(''); }}
                        className="w-full text-gray-500 hover:text-gray-700 text-sm py-1"
                    >
                        ← E-posta adresini değiştir
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="text-accent hover:underline text-sm">
                    ← Giriş sayfasına dön
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
