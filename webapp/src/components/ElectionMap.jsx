import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ElectionMap({ geoData, results, onSelectBureau }) {
  const [map, setMap] = useState(null);

  const getColor = (pct) => {
    // 0% Moudenc -> Slate 700 (#334155)
    // 100% Moudenc -> Toulouse Red (#e2001a)
    if (pct === null) return '#f1f5f9';
    
    const factor = pct / 100;
    // Interpolation between Slate 700 (51, 65, 85) and Toulouse Red (226, 0, 26)
    const r = Math.round(51 + (226 - 51) * factor);
    const g = Math.round(65 + (0 - 65) * factor);
    const b = Math.round(85 + (26 - 85) * factor);
    return `rgb(${r},${g},${b})`;
  };

  const style = useCallback((feature) => {
    const bdv = feature.properties.uniq_bdv;
    const result = results.find(r => r['n° de bureau de vote'] === bdv);
    const scoreM = result ? (result['Nombre de voix de la liste 01'] / result["Nombre d'exprimés"] * 100) : null;
    
    return {
      fillColor: getColor(scoreM),
      weight: 0.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.9
    };
  }, [results]);

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          fillOpacity: 0.9,
          weight: 3,
          color: 'rgba(255, 255, 255, 0.5)'
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(style(feature));
      },
      click: (e) => {
        onSelectBureau(feature.properties.uniq_bdv);
        if (map) map.flyTo(e.latlng, 14, { duration: 1.5 });
      }
    });
  };

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={[43.6045, 1.4442]} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        ref={setMap}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      
      {/* Decorative Overlay for depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-[1001] rounded-3xl" />
    </div>
  );
}
