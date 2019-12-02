export interface ShipyardXML {
  Shipyard: Shipyard;
}

export interface Shipyard {
  Spaces: Spaces;
  Appearance: ShipyardAppearance;
  _Version: string;
  _Updated: string;
}

export interface ShipyardAppearance {
  Space: AppearanceSpace;
}

export interface AppearanceSpace {
  Road: ProductSelected;
  AreaHover: AreaHover;
  Area: FontClass;
  Groups: Groups;
  Product: Product;
  ProductSelected: ProductSelected;
}

export interface FontClass {
  _IsSizeRelative: string;
  _Size: string;
  _IsWrapped: string;
  _TextAlignment: string;
  _VerticalAlignment: string;
}

export interface AreaHover {
  Appearance: ProductSelected;
  Thickness: Thickness;
  Background: ProductSelected;
}

export interface ProductSelected {
  _Color: string;
}

export interface Thickness {
  _Left: string;
  _Top: string;
  _Right: string;
  _Bottom: string;
  _Radius: string;
}

export interface Groups {
  Group: GroupStyle[];
}

export interface GroupStyle {
  Appearance: GroupAppearance;
  Thickness: Thickness;
  Background: ProductSelected;
  _Name: string;
  Foreground?: ProductSelected;
  _Z?: string;
}

export interface GroupAppearance {
  _Color: string;
  _Opacity?: string;
}

export interface Product {
  Appearance: ProductSelected;
  Thickness: Thickness;
  Foreground: ProductSelected;
  Font: FontClass;
}

export interface Spaces {
  Space: SpaceElement[];
  _X: string;
  _Y: string;
  _HorizontalMargin: string;
  _VerticalMargin: string;
  _EditingAngle: string;
  _Left: string;
  _Top: string;
  _Bottom: string;
  _Right: string;
  _IsExtended: string;
  _IsZoomCentered: string;
}

export interface SpaceElement {
  LandScape?: LandScapeClass;
  Road?: Road;
  Area?: LandScapeClass;
  QuayName?: LandScapeClass;
}

export interface LandScapeClass {
  Points: Points;
  Origin: Coordinate;
  Coordinate: Coordinate;
  _Key: string;
  _Name: string;
  _Group: AreaGroup;
  _IsClosed?: string;
}

export interface Coordinate {
  _X: string;
  _Y: string;
}

export interface Points {
  Point: Coordinate[];
}

export enum AreaGroup {
  GIFCoastline = 'GIF_COASTLINE',
  GIFCoastlineP = 'GIF_COASTLINE_P',
  GIFLotmiddle = 'GIF_LOTMIDDLE',
  GIFLotsmall = 'GIF_LOTSMALL',
  GIFQuayname = 'GIF_QUAYNAME'
}

export interface Road {
  Points?: Points;
  Origin: Coordinate;
  Coordinate: Coordinate;
  _Key: string;
  _Name: string;
  _Group: RoadGroup;
  _Width: string;
  _Lane: string;
  CenterPoints?: Points;
}

export enum RoadGroup {
  GIFRoad = 'GIF_ROAD',
  GIFRoadcenterline = 'GIF_ROADCENTERLINE'
}
