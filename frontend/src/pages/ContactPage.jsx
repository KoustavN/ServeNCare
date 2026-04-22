import React, { useState } from "react";
import "./ContactPage.css";
import {
	MapPin,
	Phone,
	Mail,
	Clock,
	Send,
	User,
	MessageSquare,
} from "lucide-react";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		message: "",
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission logic here
		console.log("Form submitted:", formData);
	};

	const contactInfo = [
		{
			icon: MapPin,
			title: "Visit Us",
			details: ["LPU, Punjab", "India"],
			color: "#2d9f84",
		},
		{
			icon: Phone,
			title: "Call Us",
			details: ["+91 9876543210", "Mon-Sat 9AM-8PM"],
			color: "#238871",
		},
		{
			icon: Mail,
			title: "Email Us",
			details: ["support@servencare.com", "Response within 24h"],
			color: "#1e7a6d",
		},
		{
			icon: Clock,
			title: "Working Hours",
			details: ["Monday - Saturday", "Sunday: Closed"],
			color: "#2d9f84",
		},
	];

	const quickLinks = [
		"Become a Service Provider",
		"Request a Service",
		"Track Your Order",
		"Report an Issue",
		"FAQs & Help Center",
	];

	return (
		<div className="contact-page">
			{/* Hero Section */}
			<section className="contact-hero">
				<div className="container">
					<div className="contact-hero-content">
						<h1 className="contact-hero-title">Get in Touch</h1>
						<p className="contact-hero-subtitle">
							Have a question or need assistance? We're here to
							help! Reach out to our team and we'll get back to
							you as soon as possible.
						</p>
					</div>
				</div>
			</section>

			{/* Contact Info Cards */}
			<section className="contact-info-section">
				<div className="container">
					<div className="contact-info-grid">
						{contactInfo.map((info, index) => (
							<div key={index} className="contact-info-card">
								<div
									className="info-icon"
									style={{
										background: `linear-gradient(135deg, ${info.color}, ${info.color}dd)`,
									}}
								>
									<info.icon size={28} />
								</div>
								<h3>{info.title}</h3>
								{info.details.map((detail, i) => (
									<p key={i}>{detail}</p>
								))}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Main Contact Section */}
			<section className="contact-main-section">
				<div className="container">
					<div className="contact-main-grid">
						{/* Contact Form */}
						<div className="contact-form-wrapper">
							<h2 className="form-title">Send Us a Message</h2>
							<p className="form-subtitle">
								Fill out the form below and our team will
								respond within 24 hours
							</p>

							<form
								onSubmit={handleSubmit}
								className="contact-form"
							>
								<div className="form-group">
									<label htmlFor="name">
										<User size={18} />
										Full Name *
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={formData.name}
										onChange={handleChange}
										placeholder="Enter your full name"
										required
									/>
								</div>

								<div className="form-row">
									<div className="form-group">
										<label htmlFor="email">
											<Mail size={18} />
											Email Address *
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
										/>
									</div>
								</div>

								<div className="form-group">
									<label htmlFor="subject">
										<MessageSquare size={18} />
										Subject *
									</label>
									<input
										type="text"
										id="subject"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										placeholder="What is this regarding?"
										required
									/>
								</div>

								<div className="form-group">
									<label htmlFor="message">
										<MessageSquare size={18} />
										Your Message *
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleChange}
										placeholder="Tell us more about your inquiry..."
										rows="6"
										required
									></textarea>
								</div>

								<button
									type="submit"
									className="btn-primary submit-btn"
								>
									<Send size={20} />
									Send Message
								</button>
							</form>
						</div>

						{/* Quick Links & Additional Info */}
						<div className="contact-sidebar">
							<div className="sidebar-card">
								<h3>Quick Links</h3>
								<ul className="quick-links">
									{quickLinks.map((link, index) => (
										<li key={index}>
											<a href="#">{link}</a>
										</li>
									))}
								</ul>
							</div>

							<div className="sidebar-card">
								<h3>Need Immediate Help?</h3>
								<p>
									For urgent matters, please call our support
									hotline:
								</p>
								<a
									href="tel:+919876543210"
									className="emergency-phone"
								>
									<Phone size={20} />
									+91 9876543210
								</a>
								<p className="available-text">
									Available 24/7 for emergencies
								</p>
							</div>

							<div className="sidebar-card social-card">
								<h3>Follow Us</h3>
								<p>Stay connected on social media</p>
								<div className="social-links">
									<a
										href="#"
										className="social-icon facebook"
									>
										<svg
											width="24"
											height="24"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
										</svg>
									</a>
									<a href="#" className="social-icon twitter">
										<svg
											width="24"
											height="24"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
										</svg>
									</a>
									<a
										href="#"
										className="social-icon instagram"
									>
										<svg
											width="24"
											height="24"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<rect
												x="2"
												y="2"
												width="20"
												height="20"
												rx="5"
												ry="5"
											/>
											<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
											<line
												x1="17.5"
												y1="6.5"
												x2="17.51"
												y2="6.5"
											/>
										</svg>
									</a>
									<a
										href="#"
										className="social-icon linkedin"
									>
										<svg
											width="24"
											height="24"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
											<rect
												x="2"
												y="9"
												width="4"
												height="12"
											/>
											<circle cx="4" cy="4" r="2" />
										</svg>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Map Section (Optional - placeholder) */}
			<section className="contact-map-section">
				<div className="container">
					<div className="map-placeholder">
						<MapPin size={48} />
						<h3>Find Us on Map</h3>
						<p>123 Service Street, Bangalore, Karnataka 560001</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ContactPage;
