import { useEffect, useState } from 'react';
import type { Student } from '../types';
import { getStudents } from '../services/studentService';
export function useStudents() { const [data,setData]=useState<Student[]>([]); const [loading,setLoading]=useState(true); useEffect(()=>{getStudents().then(setData).finally(()=>setLoading(false));},[]); return { data, loading }; }
