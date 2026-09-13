import { useEffect, useState } from 'react';
import { getResults } from '../services/academicService';
export function useAcademic() { const [data,setData]=useState<Awaited<ReturnType<typeof getResults>>>([]); const [loading,setLoading]=useState(true); useEffect(()=>{getResults().then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
