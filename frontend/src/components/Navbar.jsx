import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (!userMenuOpen) return;
		const close = () => setUserMenuOpen(false);
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, [userMenuOpen]);

	const navLinks = [
		{ name: "Home", href: "/" },
		{ name: "Services", href: "/services" },
		{ name: "About", href: "/about" },
		{ name: "Contact", href: "/contact" },
	];

	return (
		<nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
			<div className="navbar-container container">
				{/* Logo */}
				<Link to="/" className="navbar-logo">
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
								fill="#2d9f84"
								opacity="0.1"
							/>
							<path
								d="M20 8L28 14V26L20 32L12 26V14L20 8Z"
								fill="#2d9f84"
							/>
							<path
								d="M20 16C21.6569 16 23 17.3431 23 19C23 20.6569 21.6569 22 20 22C18.3431 22 17 20.6569 17 19C17 17.3431 18.3431 16 20 16Z"
								fill="white"
							/>
						</svg>
					</div>
					<span className="logo-text">
						<span className="logo-main">Serve & Care</span>
					</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="navbar-links">
					{navLinks.map((link) => (
						<NavLink
							key={link.name}
							to={link.href}
							className={({ isActive }) =>
								isActive ? "nav-link active" : "nav-link"
							}
						>
							{link.name}
						</NavLink>
					))}
				</div>

				<div className="navbar-actions">
					{user ? (
						<div className="navbar-user-wrap">
							<button
								type="button"
								className="navbar-user-btn"
								onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
								aria-expanded={userMenuOpen}
							>
								<span className="navbar-avatar">{user.avatar_url ? <img src={user.avatar_url} alt="" /> : (user.full_name?.[0] || "?")}</span>
								<span className="navbar-user-name">{user.full_name}</span>
								<ChevronDown size={16} />
							</button>
							{userMenuOpen && (
								<div className="navbar-user-dropdown" onClick={(e) => e.stopPropagation()}>
									<Link to={user.role === "admin" ? "/dashboard/admin" : user.role === "provider" ? "/dashboard/provider" : "/dashboard"} onClick={() => { setUserMenuOpen(false); setIsMobileMenuOpen(false); }}>
										<LayoutDashboard size={18} /> Dashboard
									</Link>
									<button type="button" onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); setIsMobileMenuOpen(false); }}>
										<LogOut size={18} /> Log out
									</button>
								</div>
							)}
						</div>
					) : (
						<>
							<Link to="/login" className="btn-login">Login</Link>
							<Link to="/signup" className="btn btn-primary btn-register">Register</Link>
						</>
					)}
					<button type="button" className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			<div
				className={`mobile-menu ${
					isMobileMenuOpen ? "mobile-menu-open" : ""
				}`}
			>
				<div className="mobile-menu-links">
					{navLinks.map((link) => (
						<NavLink
							key={link.name}
							to={link.href}
							className={({ isActive }) =>
								isActive
									? "mobile-nav-link active"
									: "mobile-nav-link"
							}
							onClick={() => setIsMobileMenuOpen(false)}
						>
							{link.name}
						</NavLink>
					))}
				</div>
				<div className="mobile-menu-actions">
					{user ? (
						<>
							<Link to={user.role === "admin" ? "/dashboard/admin" : user.role === "provider" ? "/dashboard/provider" : "/dashboard"} className="btn btn-primary" style={{ width: "100%", marginBottom: "1rem" }} onClick={() => setIsMobileMenuOpen(false)}>
								Dashboard
							</Link>
							<button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => { logout(); navigate("/"); setIsMobileMenuOpen(false); }}>
								Log out
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="btn btn-secondary" style={{ width: "100%", marginBottom: "1rem" }}>Login</Link>
							<Link to="/signup" className="btn btn-primary" style={{ width: "100%" }}>Register</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
