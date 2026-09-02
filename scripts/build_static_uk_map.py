"""Build the offline, label-free UK survey sheet used by the map round."""

from io import BytesIO
from math import asinh, floor, pi, radians, tan
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

WEST, SOUTH, EAST, NORTH = -9.9, 49.4, 2.3, 61.2
ZOOM = 6
TILE_SIZE = 512  # CARTO @2x tiles
OUTPUT = Path(__file__).parents[1] / "public/assets/maps/uk-osm-nolabels-v2.webp"


def world_pixel(lng: float, lat: float) -> tuple[float, float]:
    scale = TILE_SIZE * (2**ZOOM)
    x = (lng + 180) / 360 * scale
    y = (1 - asinh(tan(radians(lat))) / pi) / 2 * scale
    return x, y


left, top = world_pixel(WEST, NORTH)
right, bottom = world_pixel(EAST, SOUTH)
min_x, max_x = floor(left / TILE_SIZE), floor((right - 1) / TILE_SIZE)
min_y, max_y = floor(top / TILE_SIZE), floor((bottom - 1) / TILE_SIZE)

sheet = Image.new("RGB", ((max_x - min_x + 1) * TILE_SIZE, (max_y - min_y + 1) * TILE_SIZE))
for tile_y in range(min_y, max_y + 1):
    for tile_x in range(min_x, max_x + 1):
        url = f"https://a.basemaps.cartocdn.com/light_nolabels/{ZOOM}/{tile_x}/{tile_y}@2x.png"
        request = Request(url, headers={"User-Agent": "The Bureau local map builder/1.0"})
        with urlopen(request, timeout=30) as response:
            tile = Image.open(BytesIO(response.read())).convert("RGB")
        sheet.paste(tile, ((tile_x - min_x) * TILE_SIZE, (tile_y - min_y) * TILE_SIZE))

crop = (
    round(left - min_x * TILE_SIZE),
    round(top - min_y * TILE_SIZE),
    round(right - min_x * TILE_SIZE),
    round(bottom - min_y * TILE_SIZE),
)
sheet.crop(crop).save(OUTPUT, "WEBP", quality=90, method=6)
print(f"Saved {OUTPUT} at {crop[2] - crop[0]}x{crop[3] - crop[1]} pixels")
