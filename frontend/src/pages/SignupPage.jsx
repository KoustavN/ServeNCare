import React, { useState } from "react";
import "./SignupPage.css";
import {
	User,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Phone,
	UserPlus,
	Check,
	ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
	const navigate = useNavigate();
	const { register, loginWithGoogle } = useAuth();
	const [userRole, setUserRole] = useState("taker");
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeToTerms: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (!formData.agreeToTerms) {
			setError("Please agree to the Terms and Privacy Policy.");
			return;
		}
		setError("");
		setLoading(true);
		try {
			const { user } = await register({
				fullName: formData.fullName,
				email: formData.email,
				phone: formData.phone || undefined,
				password: formData.password,
				role: userRole,
			});
			if (user?.role === "admin") navigate("/dashboard/admin", { replace: true });
			else if (user?.role === "provider") navigate("/dashboard/provider", { replace: true });
			else navigate("/dashboard", { replace: true });
		} catch (err) {
			setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Sign up failed. Please try again.");
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
			if (user?.role === "admin") navigate("/dashboard/admin", { replace: true });
			else if (user?.role === "provider") navigate("/dashboard/provider", { replace: true });
			else navigate("/dashboard", { replace: true });
		} catch (err) {
			setError(err.response?.data?.error || "Google sign up failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleError = () => {
		setError("Google sign-in was cancelled or failed.");
	};

	return (
		<div className="signup-page">
			<Link to="/" className="back-to-home">
				<ArrowLeft size={20} />
				Back to Home
			</Link>
			<div className="signup-container">
				{/* Left Side - Form */}
				<div className="signup-form-section">
					<div className="signup-form-wrapper">
						<div className="form-header">
							<h2>Create Account</h2>
							<p>
								Join thousands of users connecting with trusted
								service providers
							</p>
						</div>

						{/* Role Selection */}
						<div className="role-selection">
							<button
								type="button"
								className={`role-btn ${
									userRole === "taker" ? "active" : ""
								}`}
								onClick={() => setUserRole("taker")}
							>
								<User size={24} />
								<div>
									<span className="role-title">
										I'm a Customer
									</span>
									<span className="role-desc">
										Find and book services
									</span>
								</div>
								{userRole === "taker" && (
									<Check size={20} className="check-icon" />
								)}
							</button>

							<button
								type="button"
								className={`role-btn ${
									userRole === "provider" ? "active" : ""
								}`}
								onClick={() => setUserRole("provider")}
							>
								<UserPlus size={24} />
								<div>
									<span className="role-title">
										I'm a Provider
									</span>
									<span className="role-desc">
										Offer your services
									</span>
								</div>
								{userRole === "provider" && (
									<Check size={20} className="check-icon" />
								)}
							</button>
						</div>

						{error && <p className="signup-error">{error}</p>}
						<form onSubmit={handleSubmit} className="signup-form">
							<div className="form-group">
								<label htmlFor="fullName">
									<User size={18} />
									Full Name
								</label>
								<input
									type="text"
									id="fullName"
									name="fullName"
									value={formData.fullName}
									onChange={handleChange}
									placeholder="Enter your full name"
									required
								/>
							</div>

							<div className="form-row">
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
									<label htmlFor="phone">
										<Phone size={18} />
										Phone Number
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										placeholder="+91 9876543210"
										required
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="password">
										<Lock size={18} />
										Password
									</label>
									<div className="password-input-wrapper">
										<input
											type={
												showPassword
													? "text"
													: "password"
											}
											id="password"
											name="password"
											value={formData.password}
											onChange={handleChange}
											placeholder="Create a password"
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

								<div className="form-group">
									<label htmlFor="confirmPassword">
										<Lock size={18} />
										Confirm Password
									</label>
									<div className="password-input-wrapper">
										<input
											type={
												showConfirmPassword
													? "text"
													: "password"
											}
											id="confirmPassword"
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleChange}
											placeholder="Confirm your password"
											required
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={() =>
												setShowConfirmPassword(
													!showConfirmPassword
												)
											}
										>
											{showConfirmPassword ? (
												<EyeOff size={20} />
											) : (
												<Eye size={20} />
											)}
										</button>
									</div>
								</div>
							</div>

							<div className="form-checkbox">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="agreeToTerms"
										checked={formData.agreeToTerms}
										onChange={handleChange}
										required
									/>
									<span>
										I agree to the{" "}
										<a href="/terms">Terms of Service</a>{" "}
										and{" "}
										<a href="/privacy">Privacy Policy</a>
									</span>
								</label>
							</div>

							<button
								type="submit"
								className="btn-primary signup-btn"
								disabled={loading}
							>
								<UserPlus size={20} />
								{loading ? "Creating…" : "Create Account"}
							</button>
						</form>

						<div className="divider">
							<span>Or sign up with</span>
						</div>

						<div className="social-signup">
							{import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
								<div className="google-login-wrapper">
									<GoogleLogin
										onSuccess={handleGoogleSuccess}
										onError={handleGoogleError}
										theme="outline"
										size="large"
										text="signup_with"
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

						<div className="login-prompt">
							<p>
								Already have an account?{" "}
								<Link to="/login">Sign In</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Right Side - Benefits */}
				<div className="signup-benefits">
					<div className="benefits-content">
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

						<div className="benefits-text">
							<h2>Why Join ServeNCare?</h2>
						</div>

						<div className="benefit-list">
							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>Verified Professionals</h3>
									<p>
										All service providers are
										background-checked and verified
									</p>
								</div>
							</div>

							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>Secure Payments</h3>
									<p>
										Multiple payment options with 100%
										secure transactions
									</p>
								</div>
							</div>

							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>24/7 Support</h3>
									<p>
										Round-the-clock customer support for
										your queries
									</p>
								</div>
							</div>

							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>Quality Guarantee</h3>
									<p>
										Satisfaction guaranteed or your money
										back
									</p>
								</div>
							</div>

							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>Instant Booking</h3>
									<p>
										Book services instantly with real-time
										availability
									</p>
								</div>
							</div>

							<div className="benefit-item">
								<div className="benefit-icon">
									<Check size={24} />
								</div>
								<div>
									<h3>Best Prices</h3>
									<p>
										Competitive pricing with transparent
										quotes
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
