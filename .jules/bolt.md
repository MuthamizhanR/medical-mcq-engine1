## 2024-05-18 - Caching Large Dynamic JSON Loads
**Learning:** The application dynamically loads large JSON files (~1-2MB) containing subject data upon subject switch. Without caching, this causes redundant network I/O and synchronous JSON parse overhead which blocks the main thread.
**Action:** Always consider implementing an in-memory cache (`{}`) for static or large datasets loaded dynamically at runtime, especially when navigating back and forth between subjects in a single-page architecture.
