import pandas as pd
import requests
import json
import os
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# 1. Configuration des colonnes
cols_t1 = [
    "N° de séquence", "Municipales", "Année d'élection", "Tour de scrutin", "Département", "Code Insee commune", 
    "n° de bureau de vote", "Indicatif I", "Nombre d'inscrits", "Nombre d'abstentions", "Nombre de votants", 
    "Nombre votants d'après émargement", "Nombre bulletins blancs", "Nombre bulletins nuls", "Nombre d'exprimés", 
    "Nombre de listes", "Liste 01 - F Briançon", "Nombre de voix de la liste 01", "Liste 02 - G Scalli", 
    "Nombre de voix de la liste 02", "Liste 03 - M Adrada", "Nombre de voix de la liste 03", "Liste 04 - J Menendez", 
    "Nombre de voix de la liste 04", "Listes 05 - JL Moudenc", "Nombre de voix de la liste 05", "Liste 06 - J Leonardelli", 
    "Nombre de voix de la liste 06", "Liste 07 - A  Cottrel", "Nombre de voix de la liste 07", "Liste 08 - L Meilhac", 
    "Nombre de voix de la liste 08", "Liste 09 - F Piquemal", "Nombre de voix de la liste 09", "Liste 10 - V Pedinotti", 
    "Nombre de voix de la liste 10"
]

cols_t2 = [
    "N° de séquence", "Municipales", "Année d'élection", "Tour de scrutin", "Département", "Code Insee commune", 
    "n° de bureau de vote", "Indicatif I", "Nombre d'inscrits", "Nombre d'abstentions", "Nombre de votants", 
    "Nombre votants d'après émargement", "Nombre bulletins blancs", "Nombre bulletins nuls", "Nombre d'exprimés", 
    "Nombre de listes", "Liste 01 - JL Moudenc", "Nombre de voix de la liste 01", "Liste 02 - F PIQUEMAL", 
    "Nombre de voix de la liste 02"
]

# 2. Chargement des données Parquet
df1 = pd.read_parquet('resultats-elections-municipales-2026-1er-tour.parquet')
df1.columns = cols_t1
df2 = pd.read_parquet('resultats-elections-municipales-2026-2nd-tour.parquet')
df2.columns = cols_t2

# 3. Nettoyage et préparation
# On s'assure que le numéro de bureau est bien formaté (ex: 5 -> 0005)
df1['n° de bureau de vote'] = df1['n° de bureau de vote'].astype(str).str.zfill(4)
df2['n° de bureau de vote'] = df2['n° de bureau de vote'].astype(str).str.zfill(4)

# 4. Analyse globale
total_inscrits = df1["Nombre d'inscrits"].sum()
abstentions_t1 = df1["Nombre d'abstentions"].sum()
abstentions_t2 = df2["Nombre d'abstentions"].sum()
exprimés_t1 = df1["Nombre d'exprimés"].sum()
exprimés_t2 = df2["Nombre d'exprimés"].sum()

part_t1 = 100 - (abstentions_t1/total_inscrits)*100
part_t2 = 100 - (abstentions_t2/total_inscrits)*100

print("--- SYNTHÈSE GLOBALE TOULOUSE 2026 ---")
print(f"Total inscrits: {total_inscrits:,}")
print(f"Participation T1: {part_t1:.2f}%")
print(f"Participation T2: {part_t2:.2f}% (+{part_t2-part_t1:.2f} pts)")

# Résultats agrégés T1
res_t1 = {
    "Briançon (DVG)": df1["Nombre de voix de la liste 01"].sum(),
    "Scalli (DVD)": df1["Nombre de voix de la liste 02"].sum(),
    "Adrada (LO)": df1["Nombre de voix de la liste 03"].sum(),
    "Menendez (LR)": df1["Nombre de voix de la liste 04"].sum(),
    "Moudenc (DVD/LR/RE)": df1["Nombre de voix de la liste 05"].sum(),
    "Leonardelli (RN)": df1["Nombre de voix de la liste 06"].sum(),
    "Cottrel (REC)": df1["Nombre de voix de la liste 07"].sum(),
    "Meilhac (ECO)": df1["Nombre de voix de la liste 08"].sum(),
    "Piquemal (LFI/PS/EELV)": df1["Nombre de voix de la liste 09"].sum(),
    "Pedinotti (EXG)": df1["Nombre de voix de la liste 10"].sum()
}
res_t1_df = pd.Series(res_t1).sort_values(ascending=False)
res_t1_pct = (res_t1_df / exprimés_t1 * 100).round(2)

# Résultats agrégés T2
res_t2 = {
    "JL Moudenc": df2["Nombre de voix de la liste 01"].sum(),
    "F Piquemal": df2["Nombre de voix de la liste 02"].sum()
}
res_t2_df = pd.Series(res_t2)
res_t2_pct = (res_t2_df / exprimés_t2 * 100).round(2)

print("\n--- RÉSULTATS T1 (%) ---")
print(res_t1_pct)
print("\n--- RÉSULTATS T2 (%) ---")
print(res_t2_pct)

# 5. Bureaux records
df2['Vainqueur'] = df2.apply(lambda r: 'Moudenc' if r['Nombre de voix de la liste 01'] > r['Nombre de voix de la liste 02'] else 'Piquemal', axis=1)
df2['Pct_Moudenc'] = (df2['Nombre de voix de la liste 01'] / df2["Nombre d'exprimés"] * 100)
df2['Pct_Piquemal'] = (df2['Nombre de voix de la liste 02'] / df2["Nombre d'exprimés"] * 100)

top_moudenc = df2.sort_values('Pct_Moudenc', ascending=False).head(5)[['n° de bureau de vote', 'Pct_Moudenc']]
top_piquemal = df2.sort_values('Pct_Piquemal', ascending=False).head(5)[['n° de bureau de vote', 'Pct_Piquemal']]

print("\n--- TOP 5 BUREAUX MOUDENC (T2) ---")
print(top_moudenc)
print("\n--- TOP 5 BUREAUX PIQUEMAL (T2) ---")
print(top_piquemal)

# 6. Visualisation Spatiale
try:
    with open('toulouse_bureaux_vote.geojson', 'r', encoding='utf-8') as f:
        geojson = json.load(f)
except FileNotFoundError:
    print("GeoJSON non trouvé localement, arrêt.")
    exit(1)

# 6. Chargement des données spatiales (Bureaux et Secteurs)
try:
    df_secteurs = pd.read_parquet('secteurs-de-democratie-locale.parquet')
    # Correction des placeholders -9999
    df_secteurs['secteur'] = df_secteurs['secteur'].replace(-9999, "N/A")
    
    with open('toulouse_bureaux_vote.geojson', 'r', encoding='utf-8') as f:
        geojson_bureaux = json.load(f)
    
    url_secteurs = "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/secteurs-de-democratie-locale/exports/geojson"
    geojson_secteurs = requests.get(url_secteurs).json()
    
    # Intégration du mapping Bureau -> Quartier
    if not os.path.exists('bureau_to_quartier.json'):
        print("Mapping bureau -> quartier manquant. Génération en cours...")
        import subprocess
        subprocess.run(["python", "map_bureau_to_quartier.py"], check=True)
    
    with open('bureau_to_quartier.json', 'r', encoding='utf-8') as f:
        mapping_bq = json.load(f)
    
    df2['Quartier'] = df2['n° de bureau de vote'].map(mapping_bq).fillna("Inconnu")
    
    # Agrégation par Quartier pour la nouvelle couche
    df_quartiers_stats = df2.groupby('Quartier').agg({
        'Nombre d\'inscrits': 'sum',
        'Nombre d\'exprimés': 'sum',
        'Nombre de voix de la liste 01': 'sum',
        'Nombre de voix de la liste 02': 'sum'
    }).reset_index()
    
    df_quartiers_stats['Pct_Moudenc'] = (df_quartiers_stats['Nombre de voix de la liste 01'] / df_quartiers_stats["Nombre d'exprimés"] * 100)
    df_quartiers_stats['Vainqueur'] = df_quartiers_stats.apply(lambda r: 'Moudenc' if r['Nombre de voix de la liste 01'] > r['Nombre de voix de la liste 02'] else 'Piquemal', axis=1)

except Exception as e:
    print(f"Erreur lors du chargement des données : {e}")
    exit(1)

# Thème Visuel Premium
color_moudenc, color_piquemal, bg_color = "#1f77b4", "#d62728", "#f8f9fa"

# 7. Construction de la Carte Interactive de Haute Précision
fig_map = go.Figure()

# Couche 1 : Résultats par Bureau (Visible par défaut)
fig_map.add_trace(go.Choroplethmapbox(
    geojson=geojson_bureaux,
    locations=df2['n° de bureau de vote'],
    featureidkey="properties.uniq_bdv",
    z=df2['Pct_Moudenc'],
    colorscale="RdBu", zmin=30, zmax=70,
    marker_opacity=0.7, marker_line_width=0.5, marker_line_color="white",
    colorbar=dict(title="Score Moudenc (%)", thickness=15, len=0.5, x=0.95),
    hovertemplate="<b>Bureau %{location}</b><br>Moudenc: %{z:.1f}%<br>Vainqueur: %{customdata[0]}<extra></extra>",
    customdata=df2[['Vainqueur']],
    name="Votes",
    visible=True
))

# Couche 2 : Résultats par Quartier (Calculé)
fig_map.add_trace(go.Choroplethmapbox(
    geojson=geojson_secteurs,
    locations=df_quartiers_stats['Quartier'],
    featureidkey="properties.nom_quartier",
    z=df_quartiers_stats['Pct_Moudenc'],
    colorscale="RdBu", zmin=30, zmax=70,
    showscale=False,
    marker_opacity=0.8, marker_line_width=1, marker_line_color="#2c3e50",
    hovertemplate="<b>Quartier: %{location}</b><br>Moudenc: %{z:.1f}%<br>Vainqueur: %{customdata[0]}<extra></extra>",
    customdata=df_quartiers_stats[['Vainqueur']],
    name="Quartiers (Résultats)",
    visible=False
))

# Couche 3 : Secteurs & Maires (Focus Administratif)
fig_map.add_trace(go.Choroplethmapbox(
    geojson=geojson_secteurs,
    locations=df_secteurs['num_nom'],
    featureidkey="properties.num_nom",
    z=[50] * len(df_secteurs),
    colorscale=[[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']],
    showscale=False,
    marker_opacity=0.5, marker_line_width=2, marker_line_color="#2c3e50",
    hovertemplate="<b>%{customdata[0]}</b><br>Maire: %{customdata[1]}<br>Secteur: %{customdata[2]}<extra></extra>",
    customdata=df_secteurs[['nom_quartier', 'maire_de_quartier', 'secteur']],
    name="Infos Maires",
    visible=True
))

# Préparation du menu de navigation (Centres extraits du GeoJSON)
secteur_centers = {}
for f in geojson_secteurs['features']:
    props = f['properties']
    if 'nom_quartier' in props and 'geo_point_2d' in props:
        secteur_centers[props['nom_quartier']] = props['geo_point_2d']

print(f"Nombre de secteurs identifiés pour le menu : {len(secteur_centers)}")

nav_buttons = [dict(label="Toute la ville", method="relayout", 
                   args=[{"mapbox.center": {"lat": 43.6045, "lon": 1.4442}, "mapbox.zoom": 11.5}])]

for name, center in sorted(secteur_centers.items()):
    nav_buttons.append(dict(label=name, method="relayout", 
                           args=[{"mapbox.center": center, "mapbox.zoom": 14}]))

fig_map.update_layout(
    mapbox=dict(style="carto-positron", center={"lat": 43.6045, "lon": 1.4442}, zoom=11.5),
    height=850,
    margin={"r":0,"t":130,"l":0,"b":0},
    title=dict(
        text="<b>PLAN ÉLECTORAL INTERACTIF : TOULOUSE 2026</b><br>Explorer par quartier (via le menu) ou par bureau de vote",
        font=dict(size=22, family="Outfit, sans-serif"),
        x=0.05, y=0.95
    ),
    updatemenus=[
        # Menu déroulant de zoom
        dict(buttons=nav_buttons, direction="down", showactive=True, 
             x=0.02, y=0.9, xanchor="left", yanchor="top", bgcolor="white", bordercolor="#2c3e50"),
        # Commutateur de couches
        dict(type="buttons", direction="right", x=0.5, y=0.03, xanchor="center", yanchor="bottom",
             buttons=[
                 dict(label="Vue par Bureau", method="update", args=[{"visible": [True, False, True]}]),
                 dict(label="Vue par Quartier", method="update", args=[{"visible": [False, True, True]}]),
                 dict(label="Focus Maires", method="update", args=[{"visible": [False, False, True]}])
             ], bgcolor="rgba(255,255,255,0.9)", bordercolor="#2c3e50", font=dict(size=14))
    ]
)

# 8. Graphiques de synthèse (Stats) - Design Premium
fig_stats = make_subplots(
    rows=2, cols=2, 
    subplot_titles=("<b>Score 1er Tour (%)</b>", "<b>Score 2nd Tour (%)</b>", "<b>Évolution Participation</b>", "<b>Répartition des Bureaux</b>"),
    specs=[[{"type": "bar"}, {"type": "bar"}],
           [{"type": "scatter"}, {"type": "pie"}]],
    vertical_spacing=0.15,
    horizontal_spacing=0.1
)

# [Code de fig_stats identique mais avec des finitions améliorées]
# T1 Bar
fig_stats.add_trace(go.Bar(x=res_t1_pct.index, y=res_t1_pct.values, name="T1", 
                           marker=dict(color='rgba(158, 158, 158, 0.7)', line=dict(color='gray', width=1)),
                           text=res_t1_pct.values, textposition='outside'), row=1, col=1)

# T2 Bar
fig_stats.add_trace(go.Bar(x=res_t2_pct.index, y=res_t2_pct.values, name="T2", 
                           marker=dict(color=[color_moudenc, color_piquemal], line=dict(color='black', width=1)),
                           text=res_t2_pct.values, textposition='outside'), row=1, col=2)

# Participation
fig_stats.add_trace(go.Scatter(x=["T1", "T2"], y=[part_t1, part_t2], mode='lines+markers+text', 
                               line=dict(color='#2c3e50', width=3), marker=dict(size=12, symbol='diamond'),
                               text=[f"{part_t1:.1f}%", f"{part_t2:.1f}%"], textposition="top center"), row=2, col=1)

# Pie Vainqueurs
vainqueurs_counts = df2['Vainqueur'].value_counts()
fig_stats.add_trace(go.Pie(labels=vainqueurs_counts.index, values=vainqueurs_counts.values, 
                           marker=dict(colors=[color_moudenc, color_piquemal], line=dict(color='white', width=2)),
                           hole=0.4, textinfo='label+percent'), row=2, col=2)

fig_stats.update_layout(height=900, template="plotly_white", title_text="<b>DIAGNOSTIC ÉLECTORAL GLOBAL</b>",
                        paper_bgcolor=bg_color, plot_bgcolor='white', showlegend=False)

# Export avec chemins absolus pour débogage
cwd = os.getcwd()
path_map = os.path.join(cwd, "toulouse_2026_carte_interactive.html")
path_stats = os.path.join(cwd, "toulouse_2026_tableau_bord.html")

print(f"\nMode debug - Tentative d'écriture vers : {path_map}")
fig_map.write_html(path_map)
fig_stats.write_html(path_stats)

print("\n--- ANALYSES TERMINÉES ---")
if os.path.exists(path_map):
    print(f"✓ Carte interactive de nouvelle génération générée ({os.path.getsize(path_map)} octets).")
else:
    print("X ERREUR : La carte n'a pas été générée !")
if os.path.exists(path_stats):
    print(f"✓ Tableau de bord consolidé généré ({os.path.getsize(path_stats)} octets).")
