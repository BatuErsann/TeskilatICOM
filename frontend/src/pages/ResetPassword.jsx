import { Navigate } from 'react-router-dom';

// This page is no longer needed - all reset logic is handled in ForgotPassword.jsx
// Redirect any old links to forgot-password
const ResetPassword = () => {
    return <Navigate to="/forgot-password" replace />;
};

export default ResetPassword;
