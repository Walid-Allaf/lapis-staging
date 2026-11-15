import "server-only";
import { getPool } from "../backend/db/pool";
import { query } from "../backend/db/parameters";
import { ContentService } from "../backend/modules/content/service";
import { resources } from "../backend/modules/content/definitions";
import { ContentError } from "../backend/modules/content/errors";

export async function publicBlogStatus(slug: string): Promise<200 | 404 | 503> {
  try { await new ContentService(await getPool()).detail(resources.BlogPosts, { slug }); return 200; }
  catch (error) { return error instanceof ContentError && error.status === 404 ? 404 : 503; }
}

export async function publicSiteReady(): Promise<boolean> {
  try {
    const result = await query<{ Id: number }>(await getPool(), `SELECT Id FROM dbo.SiteSettings WHERE Id=1;
      SELECT TOP(1) Id FROM dbo.Services; SELECT TOP(1) Id FROM dbo.FAQs;
      SELECT TOP(1) Id FROM dbo.OurSpecialists; SELECT TOP(1) Id FROM dbo.Testimonials;
      SELECT TOP(1) Id FROM dbo.Galleries; SELECT TOP(1) Id FROM dbo.YouTubeGalleries;
      SELECT TOP(1) Id FROM dbo.BlogPosts;`);
    return result.recordset[0]?.Id === 1;
  } catch { return false; }
}
