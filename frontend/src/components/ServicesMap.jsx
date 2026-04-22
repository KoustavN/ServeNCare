import React, { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter = [19.076, 72.8777];
const defaultZoom = 10;

function FitBounds({ services }) {
  const map = useMap();
  const points = useMemo(
    () =>
      (services || [])
        .filter((s) => {
          const lat = s.latitude || s.provider_lat;
          const lng = s.longitude || s.provider_lng;
          return lat != null && lng != null;
        })
        .map((s) => {
          const lat = s.latitude || s.provider_lat;
          const lng = s.longitude || s.provider_lng;
          return [parseFloat(lat), parseFloat(lng)];
        }),
    [services]
  );

  React.useEffect(() => {
    if (points.length === 1) map.setView(points[0], 12);
    else if (points.length >= 2) map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14 });
  }, [map, points]);

  return null;
}

function MarkerWithPopup({ service, onMarkerClick }) {
  const markerRef = useRef(null);

  const handleMouseOver = () => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  };

  const handleMouseOut = () => {
    if (markerRef.current) {
      markerRef.current.closePopup();
    }
  };

  return (
    <>
      {service.service_type === 'at_customer' && service.radius_km > 0 && (
        <Circle 
          center={[service.displayLat, service.displayLng]} 
          radius={service.radius_km * 1000} 
          pathOptions={{ 
            color: '#2d9f84', 
            fillColor: '#2d9f84', 
            fillOpacity: 0.1, 
            weight: 2,
            dashArray: '5, 10'
          }} 
        />
      )}
      <Marker 
        ref={markerRef}
        position={[service.displayLat, service.displayLng]}
        icon={greenIcon}
        eventHandlers={{
          click: () => onMarkerClick(service.id),
          mouseover: handleMouseOver,
          mouseout: handleMouseOut
        }}
      >
        <Popup closeButton={true}>
          <div className="map-popup">
            <div className="map-popup-header">
              <MapPin size={16} style={{ color: '#2d9f84' }} />
              <strong>{service.title}</strong>
            </div>
            <p className="map-popup-category">{service.category_name}</p>
            <p className="map-popup-meta">
              {service.provider_name}
              {service.service_type === 'at_customer' && service.radius_km > 0 && (
                <span className="map-popup-radius"> · {service.radius_km}km radius</span>
              )}
            </p>
            <p className="map-popup-price">₹{Number(service.price).toLocaleString()}{service.price_type === 'hourly' ? '/hr' : service.payment_frequency === 'monthly' ? '/month' : ''}</p>
            <button 
              type="button"
              className="map-popup-link"
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick(service.id);
              }}
            >
              View Details →
            </button>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default function ServicesMap({ services }) {
  const navigate = useNavigate();
  
  const withLocation = useMemo(() => {
    return (services || []).filter((s) => {
      const lat = s.latitude || s.provider_lat;
      const lng = s.longitude || s.provider_lng;
      return lat != null && lng != null;
    }).map(s => {
      const lat = s.latitude || s.provider_lat;
      const lng = s.longitude || s.provider_lng;
      return {
        ...s,
        displayLat: parseFloat(lat),
        displayLng: parseFloat(lng)
      };
    });
  }, [services]);

  const handleMarkerClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="services-map-wrap">
      <MapContainer center={defaultCenter} zoom={defaultZoom} className="services-map" scrollWheelZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds services={services || []} />
        {withLocation.map((s) => (
          <MarkerWithPopup 
            key={s.id} 
            service={s} 
            onMarkerClick={handleMarkerClick}
          />
        ))}
      </MapContainer>
      {!withLocation.length && (
        <div className="services-map-empty">No services with location data in this view.</div>
      )}
    </div>
  );
}
