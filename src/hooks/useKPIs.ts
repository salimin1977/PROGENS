import { useEffect, useState } from 'react';
import { getSchoolKPIs } from '../services/kpiService';
export function useKPIs() { const [data,setData]=useState<Awaited<ReturnType<typeof getSchoolKPIs>> | null>(null); const [loading,setLoading]=useState(true); useEffect(()=>{getSchoolKPIs().then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
