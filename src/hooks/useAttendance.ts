import { useAsync, type AsyncState } from './useAsync';
import { getAttendanceOverview, type AttendanceOverview } from '../services/attendanceService';

/** School-wide attendance overview: rate, chronic absence, by-class, trend, risk correlation. */
export function useAttendance(): AsyncState<AttendanceOverview> {
  return useAsync(getAttendanceOverview, []);
}
