-- Make ngo_id nullable so payout_requests can be created for startups
ALTER TABLE payout_requests MODIFY COLUMN ngo_id BIGINT NULL;
