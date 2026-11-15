# Phase7 controlled local measurements — 2026-11-11

**PASS measured locally; NOT TESTED on MonsterASP.NET.** Latest full browser repeat used Windows, Node26.3.1, Next16.4.6 production server, local SQL Server Express17.0.1000.7, poolmax3/min0, seven-migration disposable database and private temp uploads. The mobile check failed in that run; independent functional/performance steps still executed. See [raw measurements](evidence/phase7-browser.json). This is a small development-machine sample, not a capacity/load certification.

| Measurement | Observed |
| --- | --- |
| Production startup |326ms process spawn to Next Ready output,100ms readiness polling |
| Fresh idle working set |121,110,528bytes, about115.5MiB,1.5seconds after readiness |
| Warm idle after browser use |235,548,672bytes, about224.6MiB |
| Warm GET /api/Services/get-all |30sequential requests, p50=11.03ms, p95=16.87ms, all200 |
| Concurrent reads |6workers×5requests=30,76ms wall time, all200; not a sustained load test |
| Actual Next SQL sessions |3observed for the Next PID; separate test process held2; local integrated observer filtered only the generated disposable login |
| Pool contention probe |6read-only driver queries with100ms WAITFOR; sampled every10ms: maxsize3, maxborrowed3, maxpending4; queue drained, no failures |
| Image upload |3,147,780byte synthetic1024×1024PNG through existing UI/proxy,592ms including browser transport |
| Image upload working set |237,449,216bytes before →256,184,320after; difference18,735,104bytes/about17.9MiB |

RSS uses Windows Get-Process WorkingSet64 at checkpoints, **not peak or private committed bytes**. It includes Node/native/cache effects and can vary between runs. The pool contention probe measures the isolated test process's real shared driver pool; the separate DMV observer measures the running Next process at one checkpoint, not continuously at burst peak. No public diagnostic endpoint or VIEW SERVER permission was granted to the runtime principal. The observer uses existing local Windows-integrated administrative access and is test-guarded; it never connects to hosted SQL.

Upload parsing bounds actual file and multipart bytes, validates signatures/structure/hashes and persists original bytes. PNG validation streams inflation with a64MiB decoded-size guard rather than allocating a full bitmap. Upload does not resize/recompress images. Public Next Image optimization is a separate on-demand sharp/native transform/cache and adds resource usage; its successful delivery is verified, but its peak under many unique images is NOT TESTED. The exact4MiB limit is covered by existing file SQL/boundary tests; the memory probe uses a real3MiB image rather than claiming it measured the4MiB peak. Concurrent4MiB uploads/optimization, two scrypt workers and long-lived cache growth could add materially to this snapshot.

[Premium Single published limits](https://www.monsterasp.net/) currently list512MB RAM per website/subdomain,25GB web storage and two databases with2GB each. Those are provider statements, not verified account allocations. Local snapshots fall below that nominal RAM figure but do not demonstrate host headroom, build success under host limits, recycling behavior, total worker count or sustainable concurrency. Do not infer a maximum user count.

Before release, measure the actual Node process/app-pool memory and provider accounting, cold/warm Next Image transforms, uploads near4MiB, concurrent sign-ins/scrypt, SQL session totals per worker and connection/time quotas. Review disk/SQL growth and private backup sizes. Keep the small pool; increasing it to hide latency can exhaust shared-host connections. Verify host request framing/timeouts, hard links/flushes and throttling. Host performance remains NOT TESTED until Phase7B is explicitly approved and executed.
