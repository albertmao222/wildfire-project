# pulls income + race for every zip from the census api and attaches
# it to our LA zip shapes
import os
from pathlib import Path

import geopandas as gpd
import pandas as pd
import requests

OUT = Path("../public/data")

# acs 5-year, 2020-2024 estimates (the api calls this year 2024)
URL = "https://api.census.gov/data/2024/acs/acs5"

# census variable codes -> names we'll actually use
VARS = {
    "B19013_001E": "median_income",  # median household income, dollars
    "B03002_001E": "total_pop",      # total population
    "B03002_003E": "white_nh",       # white alone, not hispanic or latino
}

params = {
    "get": ",".join(VARS),
    "for": "zip code tabulation area:*",  # every zcta in the country, one request
}

params["key"] = os.environ["CENSUS_KEY"]

r = requests.get(URL, params=params, timeout=120)
r.raise_for_status()
rows = r.json()  # first row is the header, the rest are zips
df = pd.DataFrame(rows[1:], columns=rows[0])
df = df.rename(columns={**VARS, "zip code tabulation area": "zip"})

# everything arrives as text, turn it into numbers
for col in VARS.values():
    df[col] = pd.to_numeric(df[col], errors="coerce")
    # census uses huge negatives like -666666666 for "couldn't compute this",
    # keep only real values and make the rest missing (NaN)
    df[col] = df[col].where(df[col] >= 0)

# share of residents who are anything other than non-hispanic white
df["pct_minority"] = ((1 - df["white_nh"] / df["total_pop"]) * 100).round(1)

zips = gpd.read_file(OUT / "la_zcta.geojson")
# left join: keep every zip shape, even if the census has nothing for it
merged = zips.merge(
    df[["zip", "median_income", "total_pop", "pct_minority"]], on="zip", how="left"
)

merged.to_file(OUT / "la_zips.geojson", driver="GeoJSON")
print("zips on the map:", len(merged))
print("zips missing income:", merged["median_income"].isna().sum())
print(merged["median_income"].describe())

print(merged[merged["median_income"].isna()][["zip", "total_pop"]])

buckets = [0, 50000, 75000, 100000, 125000, 150000, 1e9]
print(pd.cut(merged["median_income"], buckets, right=False).value_counts().sort_index())