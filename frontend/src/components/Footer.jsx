import React from "react";
import {
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Mail,
	Phone,
	MapPin,
	Youtube,
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		company: [
			{ name: "About Us", href: "#about" },
			{ name: "How It Works", href: "#how-it-works" },
			{ name: "Careers", href: "#careers" },
			{ name: "Press & Media", href: "#press" },
		],
		services: [
			{ name: "Browse Services", href: "#services" },
			{ name: "Repair Services", href: "#repair" },
			{ name: "Become a Provider", href: "#provider" },
			{ name: "Pricing", href: "#pricing" },
		],
		support: [
			{ name: "Help Center", href: "#help" },
			{ name: "Safety", href: "#safety" },
			{ name: "Terms & Conditions", href: "#terms" },
			{ name: "Privacy Policy", href: "#privacy" },
		],
	};

	const socialLinks = [
		{ icon: Facebook, href: "#", label: "Facebook", color: "#1877f2" },
		{ icon: Twitter, href: "#", label: "Twitter", color: "#1da1f2" },
		{ icon: Instagram, href: "#", label: "Instagram", color: "#e4405f" },
		{ icon: Linkedin, href: "#", label: "LinkedIn", color: "#0a66c2" },
		{ icon: Youtube, href: "#", label: "YouTube", color: "#ff0000" },
	];

	return (
		<footer className="footer">
			<div className="footer-main">
				<div className="container">
					<div className="footer-grid">
						{/* Brand Column */}
						<div className="footer-brand">
							<div className="footer-logo">
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
											opacity="0.1"
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
								<span className="logo-text">ServeNCare</span>
							</div>

							<p className="footer-tagline">
								Hire, Repair, and Care — Smart Services,
								Simplified.
							</p>

							<div className="footer-contact">
								<div className="contact-item">
									<Mail size={18} />
									<span>support@servencare.com</span>
								</div>
								<div className="contact-item">
									<Phone size={18} />
									<span>+1 (555) 123-4567</span>
								</div>
								<div className="contact-item">
									<MapPin size={18} />
									<span>
										123 Service Street, City, State 12345
									</span>
								</div>
							</div>

							<div className="footer-social">
								{socialLinks.map((social, index) => {
									const Icon = social.icon;
									return (
										<a
											key={index}
											href={social.href}
											className="social-link"
											aria-label={social.label}
											style={{
												"--social-color": social.color,
											}}
										>
											<Icon size={20} />
										</a>
									);
								})}
							</div>
						</div>

						{/* Links Columns */}
						<div className="footer-links-group">
							<div className="footer-column">
								<h4 className="footer-heading">Company</h4>
								<ul className="footer-links">
									{footerLinks.company.map((link, index) => (
										<li key={index}>
											<a href={link.href}>{link.name}</a>
										</li>
									))}
								</ul>
							</div>

							<div className="footer-column">
								<h4 className="footer-heading">Services</h4>
								<ul className="footer-links">
									{footerLinks.services.map((link, index) => (
										<li key={index}>
											<a href={link.href}>{link.name}</a>
										</li>
									))}
								</ul>
							</div>

							<div className="footer-column">
								<h4 className="footer-heading">Support</h4>
								<ul className="footer-links">
									{footerLinks.support.map((link, index) => (
										<li key={index}>
											<a href={link.href}>{link.name}</a>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Newsletter Column */}
						<div className="footer-newsletter">
							<h4 className="footer-heading">Stay Updated</h4>
							<p className="newsletter-text">
								Subscribe to our newsletter for the latest
								updates and offers.
							</p>
							<form className="newsletter-form">
								<input
									type="email"
									placeholder="Enter your email"
									className="newsletter-input"
								/>
								<button
									type="submit"
									className="newsletter-btn"
								>
									Subscribe
								</button>
							</form>
							<p className="newsletter-privacy">
								We respect your privacy. Unsubscribe anytime.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Bottom */}
			<div className="footer-bottom">
				<div className="container">
					<div className="footer-bottom-content">
						<p className="copyright">
							© {currentYear} ServeNCare / ServeSync. All rights
							reserved.
						</p>
						<div className="footer-bottom-links">
							<a href="#terms">Terms</a>
							<span className="separator">•</span>
							<a href="#privacy">Privacy</a>
							<span className="separator">•</span>
							<a href="#cookies">Cookies</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
