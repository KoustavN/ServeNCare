import React from "react";
import {
	Target,
	Eye,
	Heart,
	Users,
	Shield,
	Award,
	TrendingUp,
	Leaf,
	CheckCircle2,
	Globe,
} from "lucide-react";
import "./AboutPage.css";

const AboutPage = () => {
	const stats = [
		{ icon: Users, value: "10K+", label: "Active Users" },
		{ icon: Shield, value: "5K+", label: "Verified Providers" },
		{ icon: Award, value: "50K+", label: "Services Completed" },
		{ icon: Globe, value: "50+", label: "Cities Covered" },
	];

	const values = [
		{
			icon: Shield,
			title: "Trust & Safety",
			description:
				"Every provider is thoroughly background-checked and verified to ensure your safety and peace of mind.",
		},
		{
			icon: Heart,
			title: "Quality First",
			description:
				"We maintain the highest standards of service quality through continuous monitoring and feedback.",
		},
		{
			icon: Leaf,
			title: "Sustainability",
			description:
				"Promoting repair and reuse over disposal, helping reduce waste and environmental impact.",
		},
		{
			icon: TrendingUp,
			title: "Innovation",
			description:
				"Leveraging technology to make service booking simple, transparent, and efficient.",
		},
	];

	const team = [
		{
			name: "Founder & CEO",
			role: "Visionary Leader",
			description: "Leading the mission to revolutionize local services",
		},
		{
			name: "Head of Operations",
			role: "Operations Expert",
			description: "Ensuring seamless service delivery across all cities",
		},
		{
			name: "Head of Technology",
			role: "Tech Innovator",
			description:
				"Building cutting-edge platform for better experiences",
		},
		{
			name: "Head of Customer Success",
			role: "Customer Champion",
			description: "Dedicated to your satisfaction and support",
		},
	];

	return (
		<div className="about-page">
			{/* Hero Section */}
			<section className="about-hero">
				<div className="container">
					<div className="about-hero-content">
						<h1 className="about-hero-title">
							Connecting Communities Through{" "}
							<span className="white-glow">Trusted Services</span>
						</h1>
						<p className="about-hero-subtitle">
							ServeNCare is more than a platform—it's a movement
							to empower local professionals, promote
							sustainability, and make quality services accessible
							to everyone.
						</p>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="about-stats">
				<div className="container">
					<div className="stats-grid">
						{stats.map((stat, index) => {
							const Icon = stat.icon;
							return (
								<div key={index} className="stat-card">
									<div className="stat-icon">
										<Icon size={32} />
									</div>
									<div className="stat-value">
										{stat.value}
									</div>
									<div className="stat-label">
										{stat.label}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Story Section */}
			<section className="about-story section">
				<div className="container">
					<div className="story-grid">
						<div className="story-content">
							<h2 className="story-title">Our Story</h2>
							<p className="story-text">
								ServeNCare was born from a simple observation:
								finding reliable local service providers
								shouldn't be a struggle. We saw talented
								professionals going unnoticed while people
								struggled to find trustworthy help for everyday
								needs.
							</p>
							<p className="story-text">
								Today, we've built a thriving marketplace that
								connects verified professionals with customers
								across 50+ cities. Our platform not only makes
								services accessible but also promotes
								sustainable practices through our repair-first
								approach.
							</p>
							<p className="story-text">
								We're proud to have facilitated over 50,000
								successful service bookings, creating
								opportunities for local professionals while
								making life easier for thousands of families.
							</p>
						</div>
						<div className="story-visual">
							<div className="story-card story-card-1">
								<CheckCircle2 size={24} />
								<h4>Verified Professionals</h4>
								<p>100% background checked</p>
							</div>
							<div className="story-card story-card-2">
								<Shield size={24} />
								<h4>Secure Platform</h4>
								<p>Your data is protected</p>
							</div>
							<div className="story-card story-card-3">
								<Leaf size={24} />
								<h4>Eco-Friendly</h4>
								<p>Promoting sustainability</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className="mission-vision section">
				<div className="container">
					<div className="mv-grid">
						<div className="mv-card">
							<div className="mv-icon">
								<Target size={40} />
							</div>
							<h3>Our Mission</h3>
							<p>
								To create a trusted marketplace that empowers
								local service providers and makes quality
								services accessible, affordable, and sustainable
								for everyone.
							</p>
						</div>
						<div className="mv-card">
							<div className="mv-icon">
								<Eye size={40} />
							</div>
							<h3>Our Vision</h3>
							<p>
								To be India's most trusted platform for local
								services, fostering a community where quality,
								trust, and sustainability drive every
								interaction.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="values-section section">
				<div className="container">
					<h2 className="section-title">Our Core Values</h2>
					<p className="section-subtitle">
						The principles that guide everything we do
					</p>
					<div className="values-grid">
						{values.map((value, index) => {
							const Icon = value.icon;
							return (
								<div key={index} className="value-card">
									<div
										className="value-icon"
										style={{
											background: `var(--primary-green)${
												index === 0
													? "20"
													: index === 1
													? "25"
													: index === 2
													? "30"
													: "35"
											}`,
										}}
									>
										<Icon size={28} />
									</div>
									<h3>{value.title}</h3>
									<p>{value.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* Team Section */}
			<section className="team-section section">
				<div className="container">
					<h2 className="section-title">Leadership Team</h2>
					<p className="section-subtitle">
						Meet the people driving our mission forward
					</p>
					<div className="team-grid">
						{team.map((member, index) => (
							<div key={index} className="team-card">
								<div className="team-avatar">
									<Users size={40} />
								</div>
								<h3>{member.name}</h3>
								<div className="team-role">{member.role}</div>
								<p>{member.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="about-cta">
				<div className="container">
					<div className="cta-content">
						<h2>Ready to Experience the Difference?</h2>
						<p>
							Join thousands of satisfied customers and service
							providers on our platform
						</p>
						<div className="cta-buttons">
							<button className="btn btn-primary btn-lg">
								Find Services
							</button>
							<button className="btn btn-white btn-lg">
								Become a Provider
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
