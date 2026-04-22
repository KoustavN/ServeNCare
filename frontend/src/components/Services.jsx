import React, { useState } from "react";
import {
	Home,
	Wrench,
	Zap,
	Droplet,
	Scissors,
	PaintBucket,
	Car,
	Laptop,
	UtensilsCrossed,
	Shirt,
	Sofa,
	Smartphone,
	Star,
	Clock,
	Shield,
	ArrowRight,
	CheckCircle2,
} from "lucide-react";
import "./Services.css";

const Services = () => {
	const [hoveredCard, setHoveredCard] = useState(null);

	const serviceCategories = [
		{
			icon: Home,
			title: "Home Services",
			services: ["Cleaning", "Pest Control", "Gardening"],
			color: "#2d9f84",
			popular: true,
			rating: 4.9,
			providers: 450,
			avgTime: "2-3 hrs",
			startingPrice: "₹299",
		},
		{
			icon: UtensilsCrossed,
			title: "Cooking & Food",
			services: ["Personal Cook", "Catering", "Meal Prep"],
			color: "#f59e0b",
			rating: 4.8,
			providers: 320,
			avgTime: "3-4 hrs",
			startingPrice: "₹499",
		},
		{
			icon: Zap,
			title: "Electrical",
			services: ["Wiring", "Appliance Repair", "Installation"],
			color: "#eab308",
			rating: 4.7,
			providers: 280,
			avgTime: "1-2 hrs",
			startingPrice: "₹199",
		},
		{
			icon: Droplet,
			title: "Plumbing",
			services: ["Pipe Repair", "Drainage", "Installation"],
			color: "#3b82f6",
			rating: 4.8,
			providers: 310,
			avgTime: "1-3 hrs",
			startingPrice: "₹249",
		},
		{
			icon: Wrench,
			title: "Appliance Repair",
			services: ["AC Repair", "Refrigerator", "Washing Machine"],
			color: "#8b5cf6",
			popular: true,
			rating: 4.9,
			providers: 520,
			avgTime: "1-2 hrs",
			startingPrice: "₹349",
		},
		{
			icon: PaintBucket,
			title: "Painting",
			services: ["Interior", "Exterior", "Texture"],
			color: "#ec4899",
			rating: 4.6,
			providers: 190,
			avgTime: "4-8 hrs",
			startingPrice: "₹599",
		},
		{
			icon: Laptop,
			title: "Electronics Repair",
			services: ["Computer", "Mobile", "TV"],
			color: "#6366f1",
			popular: true,
			rating: 4.8,
			providers: 410,
			avgTime: "2-4 hrs",
			startingPrice: "₹399",
		},
		{
			icon: Smartphone,
			title: "Phone Repair",
			services: ["Screen", "Battery", "Software"],
			color: "#14b8a6",
			rating: 4.7,
			providers: 380,
			avgTime: "1-2 hrs",
			startingPrice: "₹299",
		},
		{
			icon: Sofa,
			title: "Furniture Repair",
			services: ["Restoration", "Upholstery", "Assembly"],
			color: "#f97316",
			rating: 4.6,
			providers: 150,
			avgTime: "2-5 hrs",
			startingPrice: "₹449",
		},
		{
			icon: Shirt,
			title: "Clothing Repair",
			services: ["Tailoring", "Alteration", "Mending"],
			color: "#a855f7",
			rating: 4.5,
			providers: 220,
			avgTime: "1-3 days",
			startingPrice: "₹99",
		},
		{
			icon: Car,
			title: "Vehicle Service",
			services: ["Maintenance", "Repair", "Cleaning"],
			color: "#0ea5e9",
			rating: 4.7,
			providers: 270,
			avgTime: "2-4 hrs",
			startingPrice: "₹799",
		},
		{
			icon: Scissors,
			title: "Salon & Beauty",
			services: ["Haircut", "Spa", "Grooming"],
			color: "#ec4899",
			rating: 4.8,
			providers: 340,
			avgTime: "1-2 hrs",
			startingPrice: "₹199",
		},
	];

	return (
		<section className="services section" id="services">
			<div className="container">
				<div className="section-header">
					<div className="section-badge">
						<Shield size={16} />
						<span>Verified Professionals</span>
					</div>
					<h2 className="section-title">
						Premium Service Marketplace
					</h2>
					<p className="section-subtitle">
						Curated services from certified professionals. Quality
						guaranteed, every time.
					</p>
				</div>

				<div className="services-grid">
					{serviceCategories.map((category, index) => {
						const Icon = category.icon;
						const isHovered = hoveredCard === index;

						return (
							<div
								key={index}
								className={`service-card ${
									isHovered ? "hovered" : ""
								}`}
								style={{ animationDelay: `${index * 0.05}s` }}
								onMouseEnter={() => setHoveredCard(index)}
								onMouseLeave={() => setHoveredCard(null)}
							>
								{/* Top accent line */}
								<div
									className="service-accent-line"
									style={{ background: category.color }}
								/>

								{/* Popular badge */}
								{category.popular && (
									<div className="service-badge">
										<Star size={12} fill="currentColor" />
										<span>Most Popular</span>
									</div>
								)}

								{/* Card header */}
								<div className="service-card-header">
									<div
										className="service-icon-wrapper"
										style={{
											background: `${category.color}10`,
										}}
									>
										<div
											className="service-icon"
											style={{
												background: `${category.color}20`,
												color: category.color,
											}}
										>
											<Icon size={28} strokeWidth={2} />
										</div>
									</div>

									{!category.popular && (
										<div
											className="service-meta-badge"
											style={{ color: category.color }}
										>
											<CheckCircle2 size={14} />
											<span>
												{category.providers}+ Pros
											</span>
										</div>
									)}
								</div>

								{/* Title */}
								<h3 className="service-title">
									{category.title}
								</h3>

								{/* Rating & Stats */}
								<div className="service-stats-row">
									<div className="stat-item">
										<Star
											size={14}
											fill={category.color}
											color={category.color}
										/>
										<span className="stat-value">
											{category.rating}
										</span>
									</div>
									<div className="stat-divider">•</div>
									<div className="stat-item">
										<Clock size={14} color="#718096" />
										<span className="stat-label">
											{category.avgTime}
										</span>
									</div>
									<div className="stat-divider">•</div>
									<div className="stat-item">
										<CheckCircle2
											size={14}
											color="#718096"
										/>
										<span className="stat-label">
											{category.providers}+ Pros
										</span>
									</div>
									<div className="stat-divider">•</div>
									<div
										className="stat-item stat-price"
										style={{ color: category.color }}
									>
										<span className="price-label">
											from
										</span>
										<span className="price-value">
											{category.startingPrice}
										</span>
									</div>
								</div>

								{/* Service list */}
								<div className="service-list-wrapper">
									<ul className="service-list">
										{category.services.map(
											(service, idx) => (
												<li key={idx}>
													<CheckCircle2
														size={14}
														color={category.color}
														strokeWidth={2.5}
													/>
													<span>{service}</span>
												</li>
											)
										)}
									</ul>
								</div>

								{/* Card footer */}
								<div className="service-card-footer">
									<button
										className="service-cta-btn"
										style={{
											"--btn-color": category.color,
											background: isHovered
												? category.color
												: "transparent",
											color: isHovered
												? "white"
												: category.color,
											borderColor: category.color,
										}}
									>
										<span>Book Now</span>
										<ArrowRight
											size={18}
											strokeWidth={2.5}
										/>
									</button>
									<div className="service-trust-note">
										<Shield size={12} />
										<span>
											Insured & Background Verified
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Bottom CTA */}
				<div className="services-bottom-cta">
					<div className="cta-content">
						<div className="cta-icon">
							<CheckCircle2 size={32} />
						</div>
						<div className="cta-text">
							<h3>Ready to Get Started?</h3>
							<p>
								Join thousands of satisfied customers connecting
								with verified local professionals. Book your
								service now and experience quality you can
								trust.
							</p>
						</div>
					</div>
					<button className="btn btn-primary btn-lg">
						Browse All Services
						<ArrowRight size={20} />
					</button>
				</div>
			</div>
		</section>
	);
};

export default Services;
