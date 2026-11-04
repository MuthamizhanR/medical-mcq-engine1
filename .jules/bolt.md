## 2024-05-24 - O(N*M) Filtering Bottleneck in Large JSONs
**Learning:** Found a severe performance bottleneck where filtering large question arrays (e.g. 1800+ questions in Medicine.json) for every topic was causing O(N*M) complexity in the rendering loop, exacerbated on every subject switch.
**Action:** When working with large client-side JSON files, always index the data (O(N)) once into a hash map during the initial load or parse phase. This transforms downstream filtering operations into O(1) lookups and significantly reduces UI blocking time.
