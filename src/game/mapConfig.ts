export const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export const UK_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-9.9, 49.4],
  [2.3, 61.2]
];

export const UK_MAP_CENTER: [number, number] = [-3.4, 55.2];

export const getMapStyleUrl = (): string => {
  const configured = (import.meta as any).env?.VITE_MAP_STYLE_URL as string | undefined;
  return configured?.trim() || DEFAULT_MAP_STYLE_URL;
};

/**
 * Convert a general-purpose OSM vector style into a Bureau game map:
 * labels, POI icons and road shields are removed so locations are not given away.
 * Remaining fills/lines are recoloured for a brighter illustrated-paper feel.
 */
export function applyBureauMapStyle(map: any): void {
  const layers = map.getStyle?.().layers ?? [];

  layers.forEach((layer: any) => {
    const id = String(layer.id || '').toLowerCase();

    try {
      if (layer.type === 'symbol') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        return;
      }

      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', '#f3e7c7');
        return;
      }

      if (layer.type === 'fill') {
        if (id.includes('water')) {
          map.setPaintProperty(layer.id, 'fill-color', '#78bfd0');
        } else if (id.includes('park') || id.includes('wood') || id.includes('forest') || id.includes('grass') || id.includes('landcover')) {
          map.setPaintProperty(layer.id, 'fill-color', '#a9c99b');
        } else if (id.includes('building')) {
          map.setPaintProperty(layer.id, 'fill-color', '#d8c69f');
        } else {
          map.setPaintProperty(layer.id, 'fill-color', '#eadfbe');
        }
        map.setPaintProperty(layer.id, 'fill-opacity', 0.92);
        return;
      }

      if (layer.type === 'line') {
        if (id.includes('water') || id.includes('river')) {
          map.setPaintProperty(layer.id, 'line-color', '#4f9eb5');
        } else if (id.includes('motorway') || id.includes('trunk')) {
          map.setPaintProperty(layer.id, 'line-color', '#cf6a51');
        } else if (id.includes('road') || id.includes('street')) {
          map.setPaintProperty(layer.id, 'line-color', '#d49b58');
        } else if (id.includes('boundary')) {
          map.setPaintProperty(layer.id, 'line-color', '#8b6d57');
        } else {
          map.setPaintProperty(layer.id, 'line-color', '#b49d79');
        }
      }
    } catch {
      // Some third-party style layers use expressions/properties that cannot be
      // overridden in every renderer version. Leave those layers untouched.
    }
  });
}
