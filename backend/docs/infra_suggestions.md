# Infrastructure Suggestions for GTFS Import

## 1. Background Job Processing
The GTFS import process involves downloading large files (approx. 50-100MB compressed, much larger uncompressed) and inserting hundreds of thousands of records. This is a long-running task that should **not** be executed within a synchronous HTTP request cycle.

**Recommendation:**
- Integrate **BullMQ** (Redis-based queue) to handle the import job.
- Create a `gtfs-import` queue.
- The HTTP endpoint should merely trigger the job (add to queue) and return a Job ID.
- Use a separate worker process or a dedicated NestJS module to process the queue.

## 2. Retry Mechanism
Network issues during download or transient database locks can cause the import to fail.

**Recommendation:**
- Configure BullMQ with a retry strategy (e.g., exponential backoff).
- Example:
  ```typescript
  {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    }
  }
  ```
- Ensure the import process is **idempotent**. Currently, the code creates new entities. If a job fails halfway and retries, it might duplicate data unless we clear existing data for the same feed version first.

## 3. Memory Management & Streaming
The current implementation loads the entire CSV content into memory strings. For `stop_times.txt` (400k+ rows), this consumes significant RAM.

**Recommendation:**
- Use **Streams** instead of loading full strings.
- `JSZip` supports node streams.
- Pipe the stream to a CSV parser like `csv-parser` or `fast-csv`.
- Process rows as they come in, maintaining the batch buffer.

## 4. Database Optimization
Inserting 400k rows with an ORM can be slow due to object overhead and validation.

**Recommendation:**
- **Disable Indexes**: Temporarily disable non-primary indexes on `gtfs_stop_times` before import and rebuild them after.
- **Raw SQL / COPY**: For maximum speed, generate a CSV on disk and use Postgres `COPY` command.
- **Batch Size**: Tune the batch size (currently 1000). Larger batches (e.g., 5000) might be faster but consume more memory.

## 5. Handling Exploded Data (Metrolinx Specific)
Metrolinx provides "exploded" data where trips are defined per day, leading to massive duplication in `stop_times`.

**Recommendation:**
- **Deduplication**: Implement a hashing strategy. Calculate a hash of the stop times sequence for a trip. If a trip has the same hash as an existing one, link it to a shared `TripPattern` or `Schedule` entity.
- **Schema Change**: This requires a significant schema change (normalizing schedules separate from trips).
- **Partitioning**: Partition the `gtfs_stop_times` table by `feed_info_id` or date range to improve query performance and manageability.
