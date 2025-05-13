# accounts/geo_utils.py
import requests

def geocode_address(address):
    print(f"📍 Geocoding: {address}")
    geocode_url = "https://nominatim.openstreetmap.org/search"
    params = {'q': address, 'format': 'json', 'limit': 1}
    response = requests.get(geocode_url, params=params, headers={"User-Agent": "geo-bot"})
    response.raise_for_status()
    data = response.json()
    if not data:
        raise ValueError("Address not found.")
    lat = float(data[0]['lat'])
    lon = float(data[0]['lon'])
    return lat, lon, data[0].get("display_name", "")

def get_zoning_info(lat, lon, geocoded_address, user_entered_address):
    zoning_url = "https://services1.arcgis.com/CjMORKCN9JBntrcv/arcgis/rest/services/RIZoningAtlas1016_WFL1/FeatureServer/14/query"
    params = {
        'geometry': f"{lon},{lat}",
        'geometryType': 'esriGeometryPoint',
        'inSR': '4326',
        'spatialRel': 'esriSpatialRelIntersects',
        'outFields': '*',
        'returnGeometry': 'false',
        'f': 'geojson'
    }
    response = requests.get(zoning_url, params=params)
    response.raise_for_status()
    data = response.json()
    if not data["features"]:
        return None
    props = data["features"][0]["properties"]
    props["geocoded_address"] = geocoded_address
    props["coordinates"] = {"lat": lat, "lon": lon}
    props["entered_address"] = user_entered_address
    return props