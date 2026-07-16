-- Add submitted as a distinct entry state in its own migration transaction.
-- PostgreSQL requires a newly-added enum value to commit before it is used.

alter type public.ballot_status add value if not exists 'submitted' after 'draft';
