import { useEffect, useState } from 'react';
import { getInterventions } from '../services/interventionService';
export function useInterventions() { const [data,setData]=useState<Awaited<ReturnType<typeof getInterventions>>>([]); const [loading,setLoading]=useState(true); useEffect(()=>{getInterventions().then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
