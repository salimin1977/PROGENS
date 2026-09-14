# PROGENS — Fasa 6–8

## Fasa 6 — Student 360

Student profile kini mempunyai pandangan 360 yang menggabungkan:
- keputusan akademik terkini, satu keputusan bagi setiap murid-subjek;
- kekuatan dan jurang berdasarkan markah semasa;
- hari tidak hadir daripada rekod agregat yang tersedia;
- risiko dan status intervensi;
- fasa SEEDS / GROW / REAP mengikut tingkatan;
- tindakan seterusnya dan liputan data.

Kadar kehadiran tidak direka semula sebagai peratus tanpa denominator hari persekolahan.

## Fasa 7 — School Intelligence

Lapisan intelligence menyediakan:
- data coverage;
- purata akademik keputusan terkini;
- Critical + High dan intervention gap;
- signal ketidakhadiran ≥10 hari;
- top academic bottlenecks;
- prestasi mengikut tingkatan;
- decision protocol: coverage → bottleneck → murid → intervensi → ukur semula.

Semua analitik menggunakan data provider yang sama dengan Command Centre.

## Fasa 8 — Production Readiness

Data Health menyemak:
- kewujudan student master;
- linkage keputusan kepada student master;
- julat markah;
- liputan assessment terkini;
- duplicate logik;
- kelengkapan gred;
- linkage attendance;
- linkage intervention.

`FAIL` bermaksud data tidak wajar dijadikan asas keputusan sehingga diperbaiki. `WARN` bermaksud semakan diperlukan.

## Architecture

`Supabase → DataProvider → Analytics Engines → PROGENS UI`

Notion kekal sebagai lapisan command/longitudinal view, bukan salinan student database.

## Privacy

No. Kad Pengenalan / MyKID tidak diperlukan oleh modul Fasa 6–8 dan tidak ditambah ke UI atau model analitik.

## Release gate

1. TypeScript build lulus.
2. Lint/type-check lulus.
3. Data Health tiada `FAIL` untuk deployment dataset.
4. Semakan manusia kekal diperlukan untuk keputusan pedagogi.
