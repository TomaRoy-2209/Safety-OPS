"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Internal component to handle the drawing logic
const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Convert data to Leaflet format: [lat, lng, intensity]
    const heatData = points.map(p => [
        parseFloat(p.latitude), 
        parseFloat(p.longitude), 
        0.6 // Intensity (0.0 to 1.0)
    ]);

    // Draw the layer
    const heat = L.heatLayer(heatData, {
      radius: 25,     // How big the "blob" is
      blur: 15,       // How smooth the edges are
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' } // Color gradient
    }).addTo(map);

    // Cleanup when component unmounts
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

export default function HeatmapMap({ data }) {
  // 📍 Default Center: Dhaka (Change to your city's coords if needed)
  const defaultCenter = [23.8103, 90.4125]; 

  return (
    <MapContainer center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
      {/* The Map Tiles (OpenStreetMap)  */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* The Heat Layer */}
      <HeatmapLayer points={data} />
    </MapContainer>
  );
}