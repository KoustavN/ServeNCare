import React, { useState } from "react";
import "./LoginPage.css";
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login, loginWithGoogle } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { user } = await login(formData.email, formData.password);
			const from = location.state?.from || "/";
			if (user?.role === "admin") navigate("/dashboard/admin", { replace: true });
			else if (user?.role === "provider") navigate("/dashboard/provider", { replace: true });
			else if (user?.role === "taker") navigate(from === "/" ? "/dashboard" : from, { replace: true });
			else navigate(from && from !== "/login" ? from : "/", { replace: true });
		} catch (err) {
			setError(err.response?.data?.error || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		if (!credentialResponse?.credential) return;
		setError("");
		setLoading(true);
		try {
			const { user } = await loginWithGoogle(credentialResponse.credential);
			const from = location.state?.from || "/";
			if (user?.role === "admin") navigate("/dashboard/admin", { replace: true });
			else if (user?.role === "provider") navigate("/dashboard/provider", { replace: true });
			else if (user?.role === "taker") navigate(from === "/" ? "/dashboard" : from, { replace: true });
			else navigate(from && from !== "/login" ? from : "/", { replace: true });
		} catch (err) {
			setError(err.response?.data?.error || "Google login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleError = () => {
		setError("Google sign-in was cancelled or failed.");
	};

	return (
		<div className="login-page">
			<Link to="/" className="back-to-home">
				<ArrowLeft size={20} />
				Back to Home
			</Link>
			<div className="login-container">
				{/* Left Side - Branding */}
				<div className="login-branding">
					<div className="branding-content">
						<div className="brand-logo">
							<div className="logo-icon">
								<svg
									viewBox="0 0 40 40"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle
										cx="20"
										cy="20"
										r="18"
										fill="currentColor"
										opacity="0.2"
									/>
									<path
										d="M20 8L28 14V26L20 32L12 26V14L20 8Z"
										fill="currentColor"
									/>
									<path
										d="M20 16C21.6569 16 23 17.3431 23 19C23 20.6569 21.6569 22 20 22C18.3431 22 17 20.6569 17 19C17 17.3431 18.3431 16 20 16Z"
										fill="white"
									/>
								</svg>
							</div>
							<h1>ServeNCare</h1>
						</div>
						<div className="branding-text">
							<h2>Welcome Back!</h2>
							<p>
								Access thousands of verified service providers
								and manage your bookings with ease.
							</p>
						</div>

						<div className="feature-highlights">
							<div className="highlight-item">
								<div className="highlight-icon">✓</div>
								<span>10,000+ Active Users</span>
							</div>
							<div className="highlight-item">
								<div className="highlight-icon">✓</div>
								<span>5,000+ Service Providers</span>
							</div>
							<div className="highlight-item">
								<div className="highlight-icon">✓</div>
								<span>50,000+ Services Completed</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Side - Login Form */}
				<div className="login-form-section">
					<div className="login-form-wrapper">
						<div className="form-header">
							<h2>Sign In</h2>
							<p>Enter your credentials to access your account</p>
						</div>

						{error && <p className="login-error">{error}</p>}
						<form onSubmit={handleSubmit} className="login-form">
							<div className="form-group">
								<label htmlFor="email">
									<Mail size={18} />
									Email Address
								</label>
								<input
									type="email"
									id="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="your.email@example.com"
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">
									<Lock size={18} />
									Password
								</label>
								<div className="password-input-wrapper">
									<input
										type={
											showPassword ? "text" : "password"
										}
										id="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter your password"
										required
									/>
									<button
										type="button"
										className="password-toggle"
										onClick={() =>
											setShowPassword(!showPassword)
										}
									>
										{showPassword ? (
											<EyeOff size={20} />
										) : (
											<Eye size={20} />
										)}
									</button>
								</div>
							</div>

							<div className="form-options">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="rememberMe"
										checked={formData.rememberMe}
										onChange={handleChange}
									/>
									<span>Remember me</span>
								</label>
								<Link
									to="/forgot-password"
									className="forgot-link"
								>
									Forgot Password?
								</Link>
							</div>

							<button
								type="submit"
								className="btn-primary login-btn"
								disabled={loading}
							>
								<LogIn size={20} />
								{loading ? "Signing in…" : "Sign In"}
							</button>
						</form>

						<div className="divider">
							<span>Or continue with</span>
						</div>

						<div className="social-login">
							{import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
								<div className="google-login-wrapper">
									<GoogleLogin
										onSuccess={handleGoogleSuccess}
										onError={handleGoogleError}
										theme="outline"
										size="large"
										text="continue_with"
										shape="rectangular"
										width="100%"
									/>
								</div>
							) : (
								<button type="button" className="social-btn google" disabled title="Configure VITE_GOOGLE_CLIENT_ID">
									<svg width="20" height="20" viewBox="0 0 24 24">
										<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
										<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
										<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
										<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
									</svg>
									Google
								</button>
							)}
						</div>

						<div className="signup-prompt">
							<p>
								Don't have an account?{" "}
								<Link to="/signup">Sign Up</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
