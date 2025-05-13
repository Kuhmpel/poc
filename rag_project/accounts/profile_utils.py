# accounts/utils.py
from .models import UserProfile
from .geo_utils import geocode_address, get_zoning_info

def safe_int(val):
    try:
        return int(val)
    except (TypeError, ValueError):
        return None

def safe_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return None

def update_user_zoning_info(user_profile, zoning_data):
    user_profile.zoning_abbr = zoning_data.get('abbrvname')
    user_profile.zoning_name = zoning_data.get('name')
    user_profile.jurisdiction = zoning_data.get('Jurisdiction')

    user_profile.front_setback_ft = safe_int(zoning_data.get('family1_frontsetbackft'))
    user_profile.rear_setback_ft = safe_int(zoning_data.get('family1_rearsetbackft'))
    user_profile.side_setback_ft = safe_int(zoning_data.get('family1_sidesetbackft'))
    user_profile.max_height_ft = safe_int(zoning_data.get('family1_maxheightft'))
    user_profile.min_parking_spaces = safe_int(zoning_data.get('family1_minparking'))
    user_profile.min_lot_acres = safe_float(zoning_data.get('family1_minlotacres'))

    user_profile.address_entered = zoning_data.get('entered_address')
    user_profile.address_geocoded = zoning_data.get('geocoded_address')

    coords = zoning_data.get('coordinates', {})
    if 'lat' in coords and 'lon' in coords:
        user_profile.latitude = coords['lat']
        user_profile.longitude = coords['lon']

    user_profile.context = zoning_data
    user_profile.save()

def store_zoning_context(user):
    full_address = ", ".join(filter(None, [
        user.address_line1,
        user.address_line2,
        user.city,
        user.state,
        user.zip_code
    ]))

    try:
        lat, lon, geocoded = geocode_address(full_address)
        zoning_data = get_zoning_info(lat, lon, geocoded, full_address)
        if zoning_data:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            update_user_zoning_info(profile, zoning_data)
            return zoning_data
        else:
            raise ValueError("No zoning data found.")
    except Exception as e:
        print(f"❌ Error storing zoning context: {e}")
        raise