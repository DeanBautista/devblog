const db = require('../config/db');

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

async function getHomeData(req, res) {
  try {
    const [profileResult, statsResult, articleResult] = await Promise.all([
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
        tags: 3,
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

module.exports = {
  getHomeData,
};
