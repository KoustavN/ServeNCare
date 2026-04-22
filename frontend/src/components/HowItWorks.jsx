import React from "react";
import { Search, UserCheck, Calendar, CheckCircle } from "lucide-react";
import "./HowItWorks.css";

const HowItWorks = () => {
	const steps = [
		{
			icon: Search,
			number: "01",
			title: "Search Services",
			description:
				"Browse through our verified service providers and repair professionals near you",
			color: "#2d9f84",
		},
		{
			icon: UserCheck,
			number: "02",
			title: "Choose Provider",
			description:
				"Compare ratings, reviews, and prices to select the best provider for your needs",
			color: "#3b82f6",
		},
		{
			icon: Calendar,
			number: "03",
			title: "Book & Schedule",
			description:
				"Select a convenient time slot and confirm your booking with instant confirmation",
			color: "#f59e0b",
		},
		{
			icon: CheckCircle,
			number: "04",
			title: "Get It Done",
			description:
				"Relax while our verified professionals complete the service to your satisfaction",
			color: "#10b981",
		},
	];

	return (
		<section className="how-it-works section" id="how-it-works">
			<div className="container">
				<div className="section-header">
					<h2 className="section-title">How It Works</h2>
					<p className="section-subtitle">
						Get started in 4 simple steps — easy, fast, and
						hassle-free
					</p>
				</div>

				<div className="steps-container">
					{steps.map((step, index) => {
						const Icon = step.icon;
						return (
							<div
								key={index}
								className="step-item"
								style={{ animationDelay: `${index * 0.2}s` }}
							>
								<div
									className="step-number"
									style={{ color: step.color }}
								>
									{step.number}
								</div>

								<div
									className="step-icon-wrapper"
									style={{ background: `${step.color}15` }}
								>
									<Icon
										size={36}
										style={{ color: step.color }}
									/>
								</div>

								<h3 className="step-title">{step.title}</h3>
								<p className="step-description">
									{step.description}
								</p>

								{index < steps.length - 1 && (
									<div className="step-connector">
										<svg
											width="100%"
											height="40"
											viewBox="0 0 200 40"
											fill="none"
										>
											<path
												d="M0 20 Q 100 0, 200 20"
												stroke={step.color}
												strokeWidth="2"
												strokeDasharray="5,5"
												opacity="0.3"
											/>
										</svg>
									</div>
								)}
							</div>
						);
					})}
				</div>

				<div className="how-it-works-cta">
					<button className="btn btn-primary btn-lg">
						Start Your Journey
					</button>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
