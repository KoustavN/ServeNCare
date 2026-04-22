import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Navigation, Edit2, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css';
import './ServiceAreaMap.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map view when position changes
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && 
        !isNaN(center[0]) && !isNaN(center[1]) &&
        center[0] !== 0 && center[1] !== 0) {
      // Small delay to ensure map is ready
      const timer = setTimeout(() => {
        try {
          // Use flyTo for smooth animation
          map.flyTo(center, zoom, {
            duration: 1.5
          });
          console.log('Map centered to:', center, 'zoom:', zoom);
        } catch (err) {
          console.error('Error centering map:', err);
          // Fallback to setView
          map.setView(center, zoom);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ position, setPosition, radius, onPositionChange }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onPositionChange?.(newPos);
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup>
          Service location
          <br />
          Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
        </Popup>
      </Marker>
      {radius > 0 && (
        <Circle
          center={position}
          radius={radius * 1000} // Convert km to meters
          pathOptions={{
            color: '#2d9f84',
            fillColor: '#2d9f84',
            fillOpacity: 0.15,
            weight: 2,
          }}
        />
      )}
    </>
  );
}

export default function ServiceAreaMap({ 
  latitude, 
  longitude, 
  radius, 
  address: initialAddress,
  onLocationChange, 
  onRadiusChange,
  onAddressChange,
  serviceType = 'at_customer'
}) {
  const [position, setPosition] = useState(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [mapRadius, setMapRadius] = useState(radius || 5);
  const [address, setAddress] = useState(initialAddress || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force map re-render when needed

  // Reverse geocoding: Get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ServeNCare/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        if (onAddressChange) {
          onAddressChange(data.display_name);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Forward geocoding: Get coordinates from address
  const forwardGeocode = async (addressText) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ServeNCare/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newPos = [lat, lng];
        setPosition(newPos);
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
        setAddress(data[0].display_name);
        if (onAddressChange) {
          onAddressChange(data[0].display_name);
        }
        return true;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Address Not Found',
          text: 'Could not find the address. Please try a different address or click on the map.',
        });
        return false;
      }
    } catch (error) {
      console.error('Forward geocoding error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to search address. Please try again.',
      });
      return false;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: 'error',
        title: 'Geolocation Not Supported',
        text: 'Your browser does not support geolocation. Please use a modern browser or click on the map to set location.',
      });
      return;
    }

    setIsLoadingLocation(true);
    
    console.log('Requesting current location from browser...');
    
    // Request FRESH location from browser (maximumAge: 0 forces new location)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location received:', position.coords);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log('Setting location to:', lat, lng);
        
        const newPos = [lat, lng];
        
        // Update position state immediately
        setPosition(newPos);
        
        // Force map re-render by updating key
        setMapKey(prev => prev + 1);
        
        // Update parent form
        if (onLocationChange) {
          onLocationChange(lat, lng);
        }
        
        // Fetch address for the location
        reverseGeocode(lat, lng).then(() => {
          setIsLoadingLocation(false);
          
          Swal.fire({
            icon: 'success',
            title: 'Location Found!',
            html: `Your current location has been set:<br><strong>${lat.toFixed(6)}, ${lng.toFixed(6)}</strong><br><br>The map has been centered on your location.`,
            timer: 3000,
            showConfirmButton: false,
          });
        }).catch((err) => {
          setIsLoadingLocation(false);
          console.error('Error fetching address:', err);
          // Still show success for location, even if address fetch fails
          Swal.fire({
            icon: 'success',
            title: 'Location Found!',
            html: `Your current location has been set:<br><strong>${lat.toFixed(6)}, ${lng.toFixed(6)}</strong><br><br>Note: Address lookup failed, but location is set.`,
            timer: 3000,
            showConfirmButton: false,
          });
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = '';
        let errorTitle = 'Location Error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorTitle = 'Location Access Denied';
            errorMessage = 'Location access was denied by your browser. Please:\n\n1. Click the location icon (🔒) in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page and try again\n\nOr click on the map to set your location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorTitle = 'Location Unavailable';
            errorMessage = 'Your device could not determine your location. Please:\n\n1. Make sure GPS/location services are enabled on your device\n2. Check your device settings\n3. Try clicking on the map to set your location manually';
            break;
          case error.TIMEOUT:
            errorTitle = 'Location Timeout';
            errorMessage = 'The location request took too long. Please:\n\n1. Check your internet connection\n2. Make sure location services are enabled\n3. Try again or click on the map to set your location manually';
            break;
          default:
            errorTitle = 'Location Error';
            errorMessage = error.message || 'Failed to get your location. Please click on the map to set your location manually.';
            break;
        }
        
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'OK',
          width: '500px',
        });
      },
      {
        enableHighAccuracy: true,  // Use GPS if available
        timeout: 30000,            // 30 second timeout
        maximumAge: 0              // Force fresh location, don't use cache
      }
    );
  };

  // Sync address from props
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  // Sync position from props (only update if different)
  useEffect(() => {
    if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
      const newPos = [parseFloat(latitude), parseFloat(longitude)];
      // Check if position is significantly different (more than 0.0001 degrees, ~11 meters)
      const isDifferent = !position || 
        Math.abs(position[0] - newPos[0]) > 0.0001 || 
        Math.abs(position[1] - newPos[1]) > 0.0001;
      
      if (isDifferent) {
        setPosition(newPos);
        // Only fetch address if we don't already have one from props
        if (!initialAddress || initialAddress.trim() === '') {
          reverseGeocode(newPos[0], newPos[1]);
        } else {
          // Use the provided address
          setAddress(initialAddress);
        }
      }
    } else if (position && (latitude == null || longitude == null)) {
      setPosition(null);
      if (!initialAddress) {
        setAddress('');
      }
    }
  }, [latitude, longitude, initialAddress]);

  // Sync radius from props (only update if different)
  useEffect(() => {
    if (radius !== undefined && radius !== mapRadius) {
      setMapRadius(radius);
    }
  }, [radius]);

  // Handle position change from user interaction (map click)
  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    if (onLocationChange) {
      onLocationChange(newPosition[0], newPosition[1]);
    }
    // Fetch address for the new position
    reverseGeocode(newPosition[0], newPosition[1]);
  };

  // Handle address update
  const handleAddressUpdate = async () => {
    if (!address.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Address',
        text: 'Please enter an address.',
      });
      return;
    }
    const success = await forwardGeocode(address);
    if (success) {
      setIsEditingAddress(false);
    }
  };

  // Handle radius change from user interaction (input change)
  const handleRadiusChange = (newRadius) => {
    setMapRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  // Calculate center - use position if available, otherwise default to Delhi, India
  const center = useMemo(() => {
    if (position && position[0] && position[1]) {
      return [position[0], position[1]];
    }
    return [28.6139, 77.2090]; // Default center (Delhi, India)
  }, [position]);

  return (
    <div className="service-area-map">
      <div className="map-controls">
        <div className="map-control-group">
          <div className="map-control-header">
            <label>
              <MapPin size={16} />
              {serviceType === 'at_customer' ? 'Service Radius (km)' : 'Your Location'}
            </label>
            <button
              type="button"
              className="map-geolocate-btn"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              title="Use my current location"
            >
              <Navigation size={16} />
              {isLoadingLocation ? 'Locating...' : 'Current Location'}
            </button>
          </div>
          {serviceType === 'at_customer' ? (
            <input
              type="number"
              min="1"
              max="100"
              value={mapRadius}
              onChange={(e) => {
                const newRadius = parseInt(e.target.value) || 5;
                setMapRadius(newRadius);
                handleRadiusChange(newRadius);
              }}
              className="map-radius-input"
            />
          ) : (
            <p className="map-hint">
              Click on the map to set your location. Customers will see this address.
            </p>
          )}
        </div>
        
        {position && (
          <div className="map-address-group">
            <label>
              <MapPin size={16} />
              Address
            </label>
            {isEditingAddress ? (
              <div className="map-address-edit">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address..."
                  className="map-address-input"
                  disabled={isLoadingAddress}
                />
                <div className="map-address-actions">
                  <button
                    type="button"
                    className="map-address-btn map-address-save"
                    onClick={handleAddressUpdate}
                    disabled={isLoadingAddress}
                    title="Update location from address"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="map-address-btn map-address-cancel"
                    onClick={() => {
                      setIsEditingAddress(false);
                      // Restore original address from props or fetch if not available
                      if (initialAddress) {
                        setAddress(initialAddress);
                      } else if (position) {
                        reverseGeocode(position[0], position[1]);
                      }
                    }}
                    disabled={isLoadingAddress}
                    title="Cancel editing"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="map-address-display">
                <p className="map-address-text">
                  {isLoadingAddress 
                    ? 'Loading address...' 
                    : address 
                      ? address 
                      : initialAddress 
                        ? initialAddress 
                        : 'Click on map or use Current Location to set address'}
                </p>
                {address && (
                  <button
                    type="button"
                    className="map-address-edit-btn"
                    onClick={() => setIsEditingAddress(true)}
                    title="Edit address"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {!position && (
          <p className="map-hint-info">
            Click anywhere on the map to set the {serviceType === 'at_customer' ? 'center of your service area' : 'location of your business'}, or use the "Current Location" button.
          </p>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={position ? 12 : 6}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
          key={`map-${position ? `${position[0]}-${position[1]}` : 'no-position'}-${mapKey}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewUpdater center={center} zoom={position ? 12 : 6} />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            radius={serviceType === 'at_customer' ? mapRadius : 0}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>

      {position && serviceType === 'at_provider' && (
        <div className="map-location-info">
          <strong>Selected Location:</strong>
          <p>Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}</p>
          <a
            href={`https://www.google.com/maps?q=${position[0]},${position[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-google-link"
          >
            Open in Google Maps →
          </a>
        </div>
      )}
    </div>
  );
}
