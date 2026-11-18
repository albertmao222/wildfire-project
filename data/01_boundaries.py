# grabs census boundaries and trims them down to LA County zip codes
from pathlib import Path

import geopandas as gpd
import requests

RAW = Path("raw")
OUT = Path("../public/data")  # public/ is served as-is, so react can fetch from here
RAW.mkdir(exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

BASE = "https://www2.census.gov/geo/tiger/GENZ2020/shp/"


def download(name):
    path = RAW / name
    if path.exists():  # don't redownload on every run
        return path
    print("downloading", name)
    r = requests.get(BASE + name, timeout=300)
    r.raise_for_status()
    path.write_bytes(r.content)
    return path


zcta = gpd.read_file(download("cb_2020_us_zcta520_500k.zip"))
counties = gpd.read_file(download("cb_2020_us_county_500k.zip"))
print("zcta columns:", zcta.columns.tolist())

# LA County's id is 06 (california) + 037
la = counties[counties["GEOID"] == "06037"]

# a zip counts as "in LA county" if a point guaranteed to sit inside it
# lands inside the county. this avoids pulling in every zip that only
# touches the border
points = zcta.copy()
points["geometry"] = zcta.representative_point()
inside = gpd.sjoin(points, la[["geometry"]], predicate="within")
la_zcta = zcta[zcta["ZCTA5CE20"].isin(inside["ZCTA5CE20"])].copy()

# census files use NAD83 lat/lon, web maps expect WGS84
la_zcta = la_zcta.to_crs(epsg=4326)

# smooth out tiny wiggles (about 30 m) so the file loads fast
la_zcta["geometry"] = la_zcta.simplify(0.0003, preserve_topology=True)

# only keep what the map needs: the zip and its shape
la_zcta = la_zcta.rename(columns={"ZCTA5CE20": "zip"})[["zip", "geometry"]]

out_file = OUT / "la_zcta.geojson"
la_zcta.to_file(out_file, driver="GeoJSON")
print(f"saved {len(la_zcta)} zip areas to {out_file}")
print(f"file size: {out_file.stat().st_size / 1e6:.1f} MB")