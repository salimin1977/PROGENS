import { useEffect, useState } from 'react';
import type { Student } from '../types';
import { getStudentById } from '../services/studentService';
export function useStudent(id: string | undefined) { const [data,setData]=useState<Student>(); const [loading,setLoading]=useState(Boolean(id)); useEffect(()=>{ if(!id){setData(undefined);setLoading(false);return;} setLoading(true); getStudentById(id).then(setData).finally(()=>setLoading(false)); },[id]); return { data, loading }; }
