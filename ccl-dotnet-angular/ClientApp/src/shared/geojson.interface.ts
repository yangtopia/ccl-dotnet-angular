export type GeoCoordinate = [number, number];

export interface Geometry<T, C> {
  type: T;
  coordinates: C;
}

export interface GeoPoint extends Geometry<'Point', GeoCoordinate> { }
export interface GeoMultiPoint extends Geometry<'MultiPoint', GeoCoordinate[]> { }

export interface GeoLineString extends Geometry<'LineString', GeoCoordinate[]> { }
export interface GeoMultiLineString extends Geometry<'MultiLineString', GeoCoordinate[][]> { }

export interface GeoPolygon extends Geometry<'Polygon', GeoCoordinate[][]> { }
export interface GeoMultiPolygon extends Geometry<'MultiPolygon', GeoCoordinate[][][]> { }

export interface GeoFeature {
  type: 'Feature';
  geometry: GeoPoint | GeoMultiPoint | GeoLineString | GeoMultiLineString | GeoPolygon | GeoMultiPolygon;
  properties: {
    [key: string]: any;
  };
}

export interface GeoJson {
  type: string;
  features: GeoFeature[];
}
