# PROGENS Data Model

Core entities: Student, Teacher, Class, Subject, Assessment, AcademicResult, AttendanceRecord, Intervention, RiskProfile, SEEDSProfile, GROWProfile, REAPProfile, STEMPipeline and KPI.

The TypeScript domain model is designed to map cleanly to future PostgreSQL tables. Student identity is stable and academic results reference `studentId` rather than embedding student records.
