import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import "./Hero.css";

const Hero = () => {
	return (
		<section className="hero" id="home">
			<div className="hero-container container">
				{/* Left Content */}
				<div className="hero-content">
					<div className="hero-badge">
						<CheckCircle size={16} />
						<span>Trusted by 10,000+ Users</span>
					</div>

					<h1 className="hero-title">
						Discover & book
						<br />
						<span className="gradient-text">
							trusted services.
						</span>
					</h1>

					<p className="hero-description">
						Connect with verified providers for home services, care,
						education & more. At your place, theirs, or online.
					</p>

					<div className="hero-buttons">
						<Link to="/services" className="btn btn-primary btn-lg">
							Book Service
							<ArrowRight size={20} />
						</Link>
						<Link to="/signup" className="btn btn-secondary btn-lg">
							Join as Provider
						</Link>
					</div>

					{/* Trust Indicators */}
					<div className="hero-stats">
						<div className="stat-item">
							<div className="stat-value">10K+</div>
							<div className="stat-label">Active Users</div>
						</div>
						<div className="stat-divider"></div>
						<div className="stat-item">
							<div className="stat-value">5K+</div>
							<div className="stat-label">Providers</div>
						</div>
						<div className="stat-divider"></div>
						<div className="stat-item">
							<div className="stat-value">50K+</div>
							<div className="stat-label">Services Done</div>
						</div>
					</div>
				</div>

				{/* Right Image/Illustration */}
				<div className="hero-image">
					<div className="hero-image-wrapper">
						{/* Using a high-quality image placeholder */}
						<img
							src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"
							alt="Professional service provider"
							className="hero-main-image"
						/>

						{/* Decorative Elements */}
						<div className="hero-decoration hero-decoration-1"></div>
						<div className="hero-decoration hero-decoration-2"></div>
						<div className="hero-decoration hero-decoration-3"></div>
					</div>

					{/* Floating Card */}
					<div className="floating-card">
						<div className="floating-card-icon">
							<CheckCircle size={24} />
						</div>
						<div className="floating-card-content">
							<div className="floating-card-title">
								Verified Provider
							</div>
							<div className="floating-card-subtitle">
								100% Background Checked
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Background Elements */}
			<div className="hero-bg-shape hero-bg-shape-1"></div>
			<div className="hero-bg-shape hero-bg-shape-2"></div>
		</section>
	);
};

export default Hero;
