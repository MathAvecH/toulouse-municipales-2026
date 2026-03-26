import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ElectionMap({ geoData, results, onSelectBureau, selectedBureau, quartierMap, selectedQuartier, colorMode }) {
  const [map, setMap] = useState(null);
  const geoJsonRef = useRef(null);

  const getColor = useCallback((bureau, mode) => {
    if (!bureau) return '#d1d5db';
    
    if (mode === 'participation') {
      const p = bureau.participation;
      // 30% -> pale, 70% -> deep blue
      const t = Math.max(0, Math.min(1, (p - 30) / 40));
      const r = Math.round(219 - 180 * t);
      const g = Math.round(234 - 170 * t);
      const b = Math.round(254 - 60 * t);
      return `rgb(${r},${g},${b})`;
    }
    
    if (mode === 'swing' && bureau.participationDelta !== undefined) {
      const d = bureau.participationDelta;
      if (d === null) return '#d1d5db';
      // -5 to +15
      const t = Math.max(0, Math.min(1, (d + 2) / 15));
      const r = Math.round(254 - 200 * t);
      const g = Math.round(200 + 55 * t * (1 - t));
      const b = Math.round(200 * (1 - t) + 50);
      return `rgb(${r},${g},${b})`;
    }

    // Default: T2 Moudenc score
    const moudenc = bureau.candidates?.Moudenc?.pct ?? null;
    if (moudenc === null) return '#d1d5db';
    
    if (moudenc > 50) {
      // Moudenc leading: white -> Toulouse red
      const t = Math.min(1, (moudenc - 50) / 20);
      const r = Math.round(255 - (255 - 226) * t);
      const g = Math.round(255 - 255 * t);
      const b = Math.round(255 - (255 - 26) * t);
      return `rgb(${r},${g},${b})`;
    } else {
      // Piquemal leading: white -> deep rose
      const t = Math.min(1, (50 - moudenc) / 20);
      const r = Math.round(255 - (255 - 204) * t);
      const g = Math.round(255 - (255 - 36) * t);
      const b = Math.round(255 - (255 - 67) * t);
      return `rgb(${r},${g},${b})`;
    }
  }, []);

  const isInSelectedQuartier = useCallback((bureauId) => {
    if (!selectedQuartier || !quartierMap) return true;
    return quartierMap[bureauId] === selectedQuartier;
  }, [selectedQuartier, quartierMap]);

  const style = useCallback((feature) => {
    const bdv = feature.properties.uniq_bdv;
    const bureau = results.find(r => r.id === bdv);
    const inQuartier = isInSelectedQuartier(bdv);
    
    return {
      fillColor: getColor(bureau, colorMode),
      weight: selectedBureau === bdv ? 3 : 0.8,
      opacity: 1,
      color: selectedBureau === bdv ? '#1e293b' : 'rgba(255,255,255,0.6)',
      fillOpacity: inQuartier ? 0.85 : 0.2,
    };
  }, [results, colorMode, selectedBureau, isInSelectedQuartier, getColor]);

  const onEachFeature = useCallback((feature, layer) => {
    const bdv = feature.properties.uniq_bdv;
    const bureau = results.find(r => r.id === bdv);
    
    if (bureau) {
      const moudenc = bureau.candidates?.Moudenc;
      const piquemal = bureau.candidates?.Piquemal;
      const quartier = quartierMap ? (quartierMap[bdv] || '') : '';
      
      layer.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.5;min-width:160px">
          <div style="font-weight:800;font-size:13px;margin-bottom:4px">Bureau ${bdv}</div>
          ${quartier ? `<div style="color:#64748b;font-size:10px;margin-bottom:6px">${quartier}</div>` : ''}
          <div style="display:flex;justify-content:space-between;margin-bottom:2px">
            <span style="color:#e2001a;font-weight:700">${moudenc ? moudenc.shortName : '—'}</span>
            <span style="font-weight:800">${moudenc ? moudenc.pct.toFixed(1) + '%' : '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="color:#cc2443;font-weight:700">${piquemal ? piquemal.shortName : '—'}</span>
            <span style="font-weight:800">${piquemal ? piquemal.pct.toFixed(1) + '%' : '—'}</span>
          </div>
          <div style="border-top:1px solid #e2e8f0;padding-top:4px;color:#64748b;font-size:10px">
            Participation: <b style="color:#0f172a">${bureau.participation.toFixed(1)}%</b>
          </div>
        </div>`,
        { 
          className: 'custom-tooltip',
          direction: 'top',
          offset: [0, -10],
          sticky: true,
        }
      );
    }

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 2.5,
          color: '#1e293b',
          fillOpacity: 0.95,
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        // Reset to computed style using the ref
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        onSelectBureau(bdv);
        if (map) {
          const bounds = layer.getBounds();
          map.flyTo(bounds.getCenter(), 15, { duration: 0.8 });
        }
      }
    });
  }, [results, quartierMap, map, onSelectBureau]);

  // Force reset all styles when dependencies change
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer(layer => {
        if (layer.feature) {
          layer.setStyle(style(layer.feature));
        }
      });
    }
  }, [style]);

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[43.6045, 1.4442]} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        ref={setMap}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {geoData && (
          <GeoJSON 
            ref={geoJsonRef}
            data={geoData} 
            style={style} 
            onEachFeature={onEachFeature}
            key={`geo-${colorMode}-${selectedQuartier || 'all'}-${selectedBureau || 'none'}`}
          />
        )}
      </MapContainer>
    </div>
  );
}
