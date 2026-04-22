import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceBookingPage from "./pages/ServiceBookingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardTaker from "./pages/dashboard/DashboardTaker";
import DashboardProvider from "./pages/dashboard/DashboardProvider";
import DashboardAdmin from "./pages/dashboard/DashboardAdmin";
import MyBookings from "./pages/dashboard/MyBookings";
import ProviderServices from "./pages/dashboard/ProviderServices";
import ServiceForm from "./pages/dashboard/ServiceForm";
import ProviderBookings from "./pages/dashboard/ProviderBookings";
import ProviderEarnings from "./pages/dashboard/ProviderEarnings";
import ProviderProfile from "./pages/dashboard/ProviderProfile";
import ProviderSOS from "./pages/dashboard/ProviderSOS";
import TakerProfile from "./pages/dashboard/TakerProfile";
import AdminProfile from "./pages/dashboard/AdminProfile";
import AdminProviders from "./pages/dashboard/AdminProviders";
import FavoritesPage from "./pages/dashboard/FavoritesPage";
import AdminServices from "./pages/dashboard/AdminServices";
import AdminSos from "./pages/dashboard/AdminSos";
import Chatbot from "./components/Chatbot/Chatbot";
import "./App.css";

function App() {
	return (
		<div className="App">
			<Chatbot />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/services" element={<><Navbar /><ServicesPage /><Footer /></>} />
				<Route path="/services/:id" element={<><Navbar /><ServiceDetail /><Footer /></>} />
				<Route path="/services/:id/book" element={<><Navbar /><ServiceBookingPage /><Footer /></>} />
				<Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
				<Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route path="/dashboard" element={<ProtectedRoute allowedRoles={["taker"]}><DashboardLayout role="taker"><DashboardTaker /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/bookings" element={<ProtectedRoute allowedRoles={["taker"]}><DashboardLayout role="taker"><MyBookings /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/favorites" element={<ProtectedRoute allowedRoles={["taker"]}><DashboardLayout role="taker"><FavoritesPage /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={["taker"]}><DashboardLayout role="taker"><TakerProfile /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><DashboardProvider /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/services" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ProviderServices /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/services/new" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ServiceForm /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/services/edit/:id" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ServiceForm /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/bookings" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ProviderBookings /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/earnings" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ProviderEarnings /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/profile" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ProviderProfile /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/provider/sos" element={<ProtectedRoute allowedRoles={["provider"]}><DashboardLayout role="provider"><ProviderSOS /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><DashboardAdmin /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/admin/providers" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><AdminProviders /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/admin/services" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><AdminServices /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/admin/sos" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><AdminSos /></DashboardLayout></ProtectedRoute>} />
				<Route path="/dashboard/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout role="admin"><AdminProfile /></DashboardLayout></ProtectedRoute>} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default App;
