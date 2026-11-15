-- New deterministic slug policy; never rewrite existing slugs or merge imported rows.
IF EXISTS (SELECT SlugHash FROM dbo.BlogPosts WHERE Slug IS NOT NULL GROUP BY SlugHash HAVING COUNT(*)>1)
  THROW 51003, 'Review duplicate blog slugs before applying the content index', 1;
CREATE UNIQUE INDEX UX_BlogPosts_SlugHash ON dbo.BlogPosts(SlugHash) WHERE Slug IS NOT NULL;
