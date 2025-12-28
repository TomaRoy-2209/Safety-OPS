"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ incidents }) {
    // Default center (Dhaka)
    const position = [23.8103, 90.4125];

    return (
        <MapContainer center={position} zoom={12} style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {incidents.map((incident) => (
                <Marker key={incident.id} position={[incident.latitude, incident.longitude]}>
                    <Popup>
                        <div className="text-slate-900">
                            <strong>{incident.title}</strong><br />
                            Status: {incident.status}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
