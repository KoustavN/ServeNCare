import React from "react";
import {
	MapPin,
	Shield,
	Clock,
	MessageCircle,
	Star,
	Leaf,
	Wrench,
	Users,
} from "lucide-react";
import "./Features.css";

const Features = () => {
	const features = [
		{
			icon: MapPin,
			title: "Geo-Location Based",
			description:
				"Find verified service providers and repair shops near you with our smart location-based search.",
			color: "#2d9f84",
		},
		{
			icon: Shield,
			title: "Verified Professionals",
			description:
				"100% background-checked providers ensuring trust, safety, and quality service every time.",
			color: "#3b82f6",
		},
		{
			icon: Clock,
			title: "Flexible Scheduling",
			description:
				"Book services at your convenience with real-time slot management and instant confirmation.",
			color: "#8b5cf6",
		},
		{
			icon: MessageCircle,
			title: "Real-Time Chat",
			description:
				"Direct communication with providers for negotiations, updates, and seamless coordination.",
			color: "#ec4899",
		},
		{
			icon: Wrench,
			title: "Repair & Exchange",
			description:
				"Get repair quotes for electronics, furniture, clothing, and more. Sustainable and cost-effective.",
			color: "#f59e0b",
		},
		{
			icon: Star,
			title: "Ratings & Reviews",
			description:
				"Community-driven trust with transparent feedback and verified ratings from real customers.",
			color: "#eab308",
		},
		{
			icon: Leaf,
			title: "Eco-Tracking",
			description:
				"Track your environmental impact with CO₂ savings and earn rewards for sustainable choices.",
			color: "#10b981",
		},
		{
			icon: Users,
			title: "Open Platform",
			description:
				"Anyone can register as a provider or repairer. Inclusive, flexible, and community-driven.",
			color: "#6366f1",
		},
	];

	return (
		<section className="features section" id="features">
			<div className="container">
				<div className="section-header">
					<h2 className="section-title">
						Powerful Features for Everyone
					</h2>
					<p className="section-subtitle">
						Everything you need to hire smart, repair sustainably,
						and manage services efficiently
					</p>
				</div>

				<div className="features-grid">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<div
								key={index}
								className="feature-card"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<div
									className="feature-icon-wrapper"
									style={{ background: `${feature.color}15` }}
								>
									<Icon
										size={28}
										style={{ color: feature.color }}
									/>
								</div>
								<h3 className="feature-title">
									{feature.title}
								</h3>
								<p className="feature-description">
									{feature.description}
								</p>
								<div
									className="feature-hover-border"
									style={{ background: feature.color }}
								></div>
							</div>
						);
					})}
				</div>

				{/* CTA Section */}
				<div className="features-cta">
					<div className="features-cta-content">
						<h3>Ready to experience the difference?</h3>
						<p>Join thousands of satisfied users and providers</p>
					</div>
					<button className="btn btn-primary btn-lg">
						Get Started Now
					</button>
				</div>
			</div>
		</section>
	);
};

export default Features;
