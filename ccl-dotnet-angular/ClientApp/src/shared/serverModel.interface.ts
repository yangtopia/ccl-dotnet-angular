/**
 * * Oracle Table Schema NH800M
 * 태풍정보
 * @property {string} year_tphn_no 년도태풍번호
 * @property {string} year 시행년도
 * @property {string} mnth_date 월일
 * @property {string} tphn_no 태풍번호
 * @property {string} tphn_name 태풍이름
 * @property {number} tphn_spd 태풍풍속
 * @property {string} rgsr_date 등록일자
 * @property {string} rgsr_time 등록시각
 * @property {string} rgsr_user_id 등록자 아이디
 * @property {string?} mnt_date 수정일자
 * @property {string?} mnt_time 수정시간
 * @property {string?} mnt_user_id 수정자아이디
 */
export interface TyphoonInfo {
  year_tphn_no: string;
  year: string;
  mnth_date: string;
  tphn_no: string;
  tphn_name: string;
  tphn_spd: number;
  rgsr_date: string;
  rgsr_time: string;
  rgsr_user_id: string;
  mnt_date?: string;
  mnt_time?: string;
  mnt_user_id?: string;
}

/**
 * * Oracle Table Schema NH810M
 * 안벽정보
 * @property {string} quay_name 안벽 명칭
 * @property {string} max_wdsp 최대풍속
 * @property {string} rgsr_date 등록일자
 * @property {string} rgsr_time 등록시각
 * @property {string} rgsr_user_id 등록자 아이디
 * @property {string} mnt_date 수정일자
 * @property {string} mnt_time 수정시간
 * @property {string} mnt_user_id 수정자아이디
 */
export interface QuayInfo {
  quay_name: string;
  max_wdsp: string;
  rgsr_date: string;
  rgsr_time: string;
  rgsr_user_id: string;
  mnt_date?: string;
  mnt_time?: string;
  mnt_user_id?: string;
}

/**
 * Oracle Table Schema NH820M
 * 안벽 계류 정보
 * @property {string} year_tphn_no 년도태풍번호
 * @property {string} mnth_date 월일
 * @property {number} rev_numb  revision
 * @property {string} quay_name 안벽 명칭
 * @property {string} proj_no 공사번호
 * @property {string} alsd_dirt 접안방향
 * @property {number} real_wdsp 실제 풍속
 * @property {string} real_moor_dwg 실제 계류도면
 * @property {number} max_wdsp 최대풍속
 * @property {string} max_moor_dwg 최대계류도면
 * @property {number} sfty_wdsp 안전풍속
 * @property {string} sfty_moor_dwg 안전계류도면
 * @property {string} status 상태
 * @property {string} updt_indc 수정여부
 * @property {string} rgsr_date 등록일자
 * @property {string} rgsr_time 등록시각
 * @property {string} rgsr_user_id 등록자 아이디
 * @property {string} mnt_date 수정일자
 * @property {string} mnt_time 수정시간
 * @property {string} mnt_user_id 수정자아이디
 */
export interface QuayMooringInfo {
  year_tphn_no: string;
  mnth_date: string;
  rev_numb: number;
  quay_name: string;
  proj_no: string;
  alsd_dirt?: string;
  real_wdsp: number;
  real_moor_dwg?: string;
  max_wdsp: number;
  max_moor_dwg?: string;
  tphn_stfc: number;
  stfc_moor_dwg?: string;
  status?: string;
  updt_indc?: string;
  rgsr_date: string;
  rgsr_time: string;
  rgsr_user_id: string;
  mnt_date?: string;
  mnt_time?: string;
  mnt_user_id?: string;
  mooringStatus?: 'GREEN' | 'ORANGE' | 'RED';
}
