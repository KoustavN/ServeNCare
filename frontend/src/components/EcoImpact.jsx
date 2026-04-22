import React from "react";
import { Star, Quote } from "lucide-react";
import "./EcoImpact.css";

const Testimonials = () => {
	const testimonials = [
		{
			name: "Sarah Johnson",
			role: "Homeowner",
			image: "https://i.pravatar.cc/150?img=1",
			rating: 5,
			text: "ServeNCare made finding a reliable plumber so easy! The provider arrived on time, was professional, and fixed my issue quickly. Highly recommend!",
		},
		{
			name: "Michael Chen",
			role: "Business Owner",
			image: "https://i.pravatar.cc/150?img=3",
			rating: 5,
			text: "I've been using ServeNCare for all my office maintenance needs. The verified professionals and transparent pricing have saved me so much time and hassle.",
		},
		{
			name: "Emily Rodriguez",
			role: "Apartment Resident",
			image: "https://i.pravatar.cc/150?img=5",
			rating: 5,
			text: "Finally, a platform that makes booking home services simple! I love the chat feature for coordinating with providers. Game changer!",
		},
		{
			name: "David Thompson",
			role: "Repair Shop Owner",
			image: "https://i.pravatar.cc/150?img=7",
			rating: 5,
			text: "As a service provider on ServeNCare, I've seen my business grow significantly. The platform is easy to use and connects me with quality customers.",
		},
		{
			name: "Lisa Anderson",
			role: "Working Mom",
			image: "https://i.pravatar.cc/150?img=9",
			rating: 5,
			text: "The scheduling feature is a lifesaver! I can book services around my busy schedule. The providers are verified and professional. Love it!",
		},
		{
			name: "James Wilson",
			role: "Tech Enthusiast",
			image: "https://i.pravatar.cc/150?img=12",
			rating: 5,
			text: "Got my laptop repaired through ServeNCare. The repair shop was nearby, quoted a fair price, and had it done in a day. Excellent service!",
		},
	];

	return (
		<section className="testimonials section" id="testimonials">
			<div className="container">
				<div className="section-header">
					<h2 className="section-title">What Our Users Say</h2>
					<p className="section-subtitle">
						Join thousands of satisfied customers who trust
						ServeNCare for their service needs
					</p>
				</div>

				<div className="testimonials-grid">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className="testimonial-card"
							style={{ animationDelay: `${index * 0.1}s` }}
						>
							<div className="testimonial-header">
								<Quote className="quote-icon" size={32} />
								<div className="testimonial-rating">
									{[...Array(testimonial.rating)].map(
										(_, i) => (
											<Star
												key={i}
												size={16}
												fill="#f59e0b"
												color="#f59e0b"
											/>
										)
									)}
								</div>
							</div>

							<p className="testimonial-text">
								{testimonial.text}
							</p>

							<div className="testimonial-author">
								<img
									src={testimonial.image}
									alt={testimonial.name}
									className="author-image"
								/>
								<div className="author-info">
									<div className="author-name">
										{testimonial.name}
									</div>
									<div className="author-role">
										{testimonial.role}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Trust Badges */}
				<div className="trust-section">
					<div className="trust-stats">
						<div className="trust-stat">
							<div className="trust-value">4.9/5</div>
							<div className="trust-label">Average Rating</div>
						</div>
						<div className="trust-divider"></div>
						<div className="trust-stat">
							<div className="trust-value">50K+</div>
							<div className="trust-label">Happy Customers</div>
						</div>
						<div className="trust-divider"></div>
						<div className="trust-stat">
							<div className="trust-value">98%</div>
							<div className="trust-label">Satisfaction Rate</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
