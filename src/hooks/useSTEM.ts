import { useEffect, useState } from 'react';
import { mockDataProvider } from '../providers/MockDataProvider';
import { calculateSTEMPipeline } from '../analytics/stemAnalytics';
export function useSTEM() { const [data,setData]=useState<ReturnType<typeof calculateSTEMPipeline>>([]); const [loading,setLoading]=useState(true); useEffect(()=>{mockDataProvider.getStudents().then(calculateSTEMPipeline).then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
