import type { Assessment } from '../../types/schema';
import { ACADEMIC_YEAR } from './config';

// Two assessments per year lets the risk/trend engine compare "latest vs
// previous" performance without needing a full exam calendar.
export const ASSESSMENTS: Assessment[] = [
  { id: 'assess-ppt-2026', name: 'Peperiksaan Pertengahan Tahun 2026', assessment_type: 'PPT', academic_year_id: ACADEMIC_YEAR.id, date: '2026-05-15' },
  { id: 'assess-pat-2026', name: 'Peperiksaan Akhir Tahun 2026', assessment_type: 'PASA', academic_year_id: ACADEMIC_YEAR.id, date: '2026-10-20' },
];

export const LATEST_ASSESSMENT_ID = 'assess-pat-2026';
export const PREVIOUS_ASSESSMENT_ID = 'assess-ppt-2026';
