import json
import requests

def is_point_in_poly(x, y, poly):
    # poly is a list of [lon, lat]
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xints = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

def get_neighborhood_mapping():
    try:
        with open('toulouse_bureaux_vote.geojson', 'r', encoding='utf-8') as f:
            bureaux = json.load(f)
    except FileNotFoundError:
        print("Bureaux file not found")
        return {}
    
    url_secteurs = "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/secteurs-de-democratie-locale/exports/geojson"
    try:
        secteurs = requests.get(url_secteurs).json()
    except Exception as e:
        print(f"Failed to fetch secteurs: {e}")
        return {}

    mapping = {}
    for b in bureaux['features']:
        props = b.get('properties', {})
        b_id = props.get('uniq_bdv')
        if not b_id: continue
        
        geo = props.get('geo_point_2d')
        if not geo: continue
        lon, lat = geo['lon'], geo['lat']
        
        found_quartier = "Inconnu"
        for s in secteurs.get('features', []):
            geom = s.get('geometry', {})
            quartier_name = s.get('properties', {}).get('nom_quartier', "Inconnu")
            
            if geom.get('type') == 'Polygon':
                for ring in geom.get('coordinates', []):
                    if is_point_in_poly(lon, lat, ring):
                        found_quartier = quartier_name
                        break
            elif geom.get('type') == 'MultiPolygon':
                for poly in geom.get('coordinates', []):
                    for ring in poly:
                        if is_point_in_poly(lon, lat, ring):
                            found_quartier = quartier_name
                            break
                    if found_quartier != "Inconnu": break
            
            if found_quartier != "Inconnu":
                break
        
        mapping[b_id] = found_quartier
            
    return mapping

if __name__ == "__main__":
    mapping = get_neighborhood_mapping()
    # Save to a JSON file for the main script to use
    with open('bureau_to_quartier.json', 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    print(f"Mapping complete. {len(mapping)} bureaus mapped.")
