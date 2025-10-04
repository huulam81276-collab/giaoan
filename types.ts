export interface DurationInput {
  level: 'TieuHoc' | 'THCS';
  periods: string;
}

export interface LessonPlanInput {
  teacherName: string;
  subject: string;
  grade: string;
  duration: DurationInput;
  lessonTitle?: string;
  congVan: string;
}

interface ActivityImplementation {
  noiDung?: string; 
  sanPham?: string; 
}

interface Activity {
  mucTieu?: string;
  noiDung?: string; 
  sanPham?: string; 
  toChuc?: ActivityImplementation; 
}

export interface GeneratedLessonPlan {
  lessonTitle?: string;
  subject?: string;
  grade?: string;
  duration?: string;
  mucTieu?: {
    kienThuc?: string;
    nangLuc?: string;
    phamChat?: string;
  };
  thietBi?: string;
  tienTrinh?: {
    [key: string]: Activity;
  };
}