import { useEffect, useState } from 'react';
import { getAttendanceRisk } from '../services/attendanceService';
export function useAttendance() { const [data,setData]=useState<Awaited<ReturnType<typeof getAttendanceRisk>>>([]); const [loading,setLoading]=useState(true); useEffect(()=>{getAttendanceRisk().then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
