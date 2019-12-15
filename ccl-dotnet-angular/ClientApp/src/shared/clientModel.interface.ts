export interface TYPHOON_INFO {
  YEAR_NO: string;
  YEAR: string;
  DATE: string;
  TYPHOON_NO: number;
  TYPHOON_NAME: string;
  SPEED: number;
}

export interface QUAY_INFO {
  QUAY_ID: string;
  MAX_SPEED: number;
}

export interface QUAY_MOORING_INFO {
  YEAR_NO: string;
  DATE: string;
  REVISION: number;
  QUAY_ID: string;
  PROJ_NO: number;
  ALONGSIDE: 'Stbd' | 'Port';
  REAL_SPEED: number;
  REAL_DRAWING: string;
  MAX_SPEED?: number;
  MAX_DRAWING?: string;
  SATISFY_SPEED?: number;
  SATISFY_DRAWING?: string;
  STATUS: '완료' | '확정' | '미정';
  ISMODIFIED: 0 | 1;
}
