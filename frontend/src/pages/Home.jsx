import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Services from "../components/Services";
import HowItWorks from "../components/HowItWorks";
import EcoImpact from "../components/EcoImpact";
import Footer from "../components/Footer";

const Home = () => {
	return (
		<div className="home">
			<Navbar />
			<Hero />
			<Features />
			<Services />
			<HowItWorks />
			<EcoImpact />
			<Footer />
		</div>
	);
};

export default Home;
