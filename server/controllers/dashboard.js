const db = require('../config/db');

const TOP_ARTICLES_LIMIT = 5;
const TAG_LEADERBOARD_LIMIT = 8;

function toNonNegativeInteger(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

function mapTopArticleRow(row) {
  return {
    id: toNonNegativeInteger(row?.id),
    title: typeof row?.title === 'string' ? row.title.trim() : '',
    slug: typeof row?.slug === 'string' ? row.slug.trim() : '',
    status: typeof row?.status === 'string' ? row.status : 'published',
    views: toNonNegativeInteger(row?.views),
    likes: toNonNegativeInteger(row?.likes),
    reading_time: toNonNegativeInteger(row?.reading_time),
    published_at: row?.published_at ?? null,
    created_at: row?.created_at ?? null,
  };
}

function mapTagLeaderboardRow(row) {
  return {
    id: toNonNegativeInteger(row?.id),
    name: typeof row?.name === 'string' ? row.name.trim() : '',
    slug: typeof row?.slug === 'string' ? row.slug.trim() : '',
    article_count: toNonNegativeInteger(row?.article_count),
    total_views: toNonNegativeInteger(row?.total_views),
  };
}

async function fetchTagMetrics() {
  try {
    const [totalTagViewsResult, tagLeaderboardResult] = await Promise.all([
      db.query(
        `SELECT
           COALESCE(SUM(COALESCE(p.views, 0)), 0) AS total_tag_views
         FROM post_tags pt
         INNER JOIN posts p ON p.id = pt.post_id`
      ),
      db.query(
        `SELECT
           t.id,
           t.name,
           t.slug,
           COUNT(DISTINCT pt.post_id) AS article_count,
           COALESCE(SUM(COALESCE(p.views, 0)), 0) AS total_views
         FROM tags t
         INNER JOIN post_tags pt ON pt.tag_id = t.id
         INNER JOIN posts p ON p.id = pt.post_id
         GROUP BY t.id, t.name, t.slug
         ORDER BY total_views DESC, article_count DESC, t.name ASC
         LIMIT ?`,
        [TAG_LEADERBOARD_LIMIT]
      ),
    ]);

    const [totalTagViewsRows] = totalTagViewsResult;
    const [tagLeaderboardRows] = tagLeaderboardResult;

    return {
      totalTagViews: toNonNegativeInteger(totalTagViewsRows?.[0]?.total_tag_views),
      tagLeaderboard: Array.isArray(tagLeaderboardRows)
        ? tagLeaderboardRows.map(mapTagLeaderboardRow).filter((row) => !!row.name)
        : [],
    };
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return {
        totalTagViews: 0,
        tagLeaderboard: [],
      };
    }

    throw error;
  }
}

async function getAdminDashboardOverview(req, res) {
  try {
    const [summaryResult, topArticlesResult, tagMetrics] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*) AS total_posts,
           SUM(CASE WHEN LOWER(status) = 'published' THEN 1 ELSE 0 END) AS published_posts,
           SUM(CASE WHEN LOWER(status) = 'draft' THEN 1 ELSE 0 END) AS draft_posts,
           COALESCE(SUM(COALESCE(views, 0)), 0) AS total_views,
           COALESCE(SUM(COALESCE(likes, 0)), 0) AS total_likes
         FROM posts`
      ),
      db.query(
        `SELECT
           id,
           title,
           slug,
           status,
           COALESCE(views, 0) AS views,
           COALESCE(likes, 0) AS likes,
           COALESCE(reading_time, 0) AS reading_time,
           published_at,
           created_at
         FROM posts
         WHERE LOWER(status) = 'published'
         ORDER BY COALESCE(views, 0) DESC, COALESCE(likes, 0) DESC, COALESCE(published_at, created_at) DESC, id DESC
         LIMIT ?`,
        [TOP_ARTICLES_LIMIT]
      ),
      fetchTagMetrics(),
    ]);

    const [summaryRows] = summaryResult;
    const [topArticleRows] = topArticlesResult;

    const summaryRow = summaryRows?.[0] ?? {};

    return res.json({
      success: true,
      data: {
        summary: {
          total_posts: toNonNegativeInteger(summaryRow.total_posts),
          published_posts: toNonNegativeInteger(summaryRow.published_posts),
          draft_posts: toNonNegativeInteger(summaryRow.draft_posts),
          total_views: toNonNegativeInteger(summaryRow.total_views),
          total_likes: toNonNegativeInteger(summaryRow.total_likes),
          total_tag_views: toNonNegativeInteger(tagMetrics.totalTagViews),
        },
        top_articles: Array.isArray(topArticleRows)
          ? topArticleRows.map(mapTopArticleRow).filter((row) => row.id > 0 && row.title)
          : [],
        top_tags: Array.isArray(tagMetrics.tagLeaderboard) ? tagMetrics.tagLeaderboard : [],
      },
      meta: {
        generated_at: new Date().toISOString(),
        top_articles_limit: TOP_ARTICLES_LIMIT,
        top_tags_limit: TAG_LEADERBOARD_LIMIT,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminDashboardOverview,
};
