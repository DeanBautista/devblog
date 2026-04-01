const db = require('../config/db');

const DEFAULT_ARTICLES_PAGE = 1;
const DEFAULT_ARTICLES_LIMIT = 6;
const MAX_ARTICLES_LIMIT = 24;
const MAX_SEARCH_QUERY_LENGTH = 100;

function normalizeProfile(row) {
  if (!row) {
    return {
      id: null,
      name: 'Alex',
      avatar_url: null,
      bio: 'Crafting high-performance digital experiences through elegant code and architectural precision.',
      created_at: null,
    };
  }

  return {
    id: row.id ?? null,
    name: row.name || 'Alex',
    avatar_url: row.avatar_url || null,
    bio:
      row.bio ||
      'Crafting high-performance digital experiences through elegant code and architectural precision.',
    created_at: row.created_at || null,
  };
}

function normalizeArticles(rows) {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    reading_time: Number(row.reading_time) || 0,
    views: Number(row.views) || 0,
    published_at: row.published_at || null,
    created_at: row.created_at || null,
    cover_image: row.cover_image || null,
    author: {
      id: row.author_id ?? null,
      name: row.author_name || 'Unknown Author',
      avatar_url: row.author_avatar_url || null,
    },
  }));
}

function toPositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallbackValue;
  }

  return parsedValue;
}

function normalizeSearchQuery(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
}

async function getHomeData(req, res) {
  try {
    const tagsInPublishedPostsPromise = db
      .query(
        `SELECT COUNT(DISTINCT pt.tag_id) AS total_tags
         FROM post_tags pt
         INNER JOIN posts p ON p.id = pt.post_id
         WHERE LOWER(p.status) = 'published'`
      )
      .then(([rows]) => Number.parseInt(rows[0]?.total_tags, 10) || 0)
      .catch(() => 0);

    const [profileResult, statsResult, articleResult, totalTags] = await Promise.all([
      db.query(
        `SELECT id, name, avatar_url, bio, created_at
         FROM users
         ORDER BY id ASC
         LIMIT 1`
      ),
      db.query(
        `SELECT
            COUNT(*) AS published_articles,
            COALESCE(SUM(COALESCE(views, 0)), 0) AS total_views
         FROM posts
         WHERE LOWER(status) = 'published'`
      ),
      db.query(
        `SELECT
          p.id,
          p.title,
          p.slug,
          p.excerpt,
          p.reading_time,
          COALESCE(p.views, 0) AS views,
          p.published_at,
          p.created_at,
          p.cover_image,
          u.id AS author_id,
          u.name AS author_name,
          u.avatar_url AS author_avatar_url
        FROM posts p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE LOWER(p.status) = 'published'
        ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC
         LIMIT 3`
      ),
      tagsInPublishedPostsPromise,
    ]);

    const [profileRows] = profileResult;
    const [statsRows] = statsResult;
    const [articleRows] = articleResult;
    const stats = statsRows[0] || {};

    return res.json({
      success: true,
      hero: {
        kicker: 'Digital Architect',
        role: 'Full Stack Developer & Technical Writer',
      },
      profile: normalizeProfile(profileRows[0]),
      stats: {
        articles: Number(stats.published_articles) || 0,
        views: Number(stats.total_views) || 0,
        tags: totalTags,
      },
      featuredArticles: normalizeArticles(articleRows),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load public homepage data',
      error: error.message,
    });
  }
}

async function listPublicArticles(req, res) {
  const requestedPage = toPositiveInteger(req.query.page, DEFAULT_ARTICLES_PAGE);
  const rawLimit = toPositiveInteger(req.query.limit, DEFAULT_ARTICLES_LIMIT);
  const limit = Math.min(rawLimit, MAX_ARTICLES_LIMIT);
  const searchQuery = normalizeSearchQuery(req.query.q);

  const whereClauses = [`LOWER(p.status) = 'published'`];
  const whereParams = [];

  if (searchQuery) {
    whereClauses.push('LOWER(p.title) LIKE ?');
    whereParams.push(`%${searchQuery.toLowerCase()}%`);
  }

  const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM posts p
       ${whereClause}`,
      whereParams
    );

    const total = Number.parseInt(countRows[0]?.total, 10) || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.reading_time,
        COALESCE(p.views, 0) AS views,
        p.published_at,
        p.created_at,
        p.cover_image,
        u.id AS author_id,
        u.name AS author_name,
        u.avatar_url AS author_avatar_url
      FROM posts p
      LEFT JOIN users u ON u.id = p.user_id
      ${whereClause}
      ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC
      LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    return res.json({
      success: true,
      data: normalizeArticles(rows),
      activeSearch: searchQuery,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load public articles',
      error: error.message,
    });
  }
}

module.exports = {
  getHomeData,
  listPublicArticles,
};
