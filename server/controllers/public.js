const db = require('../config/db');
const { normalizeSlug } = require('../utils/slug');

const DEFAULT_ARTICLES_PAGE = 1;
const DEFAULT_ARTICLES_LIMIT = 6;
const MAX_ARTICLES_LIMIT = 24;
const MAX_SEARCH_QUERY_LENGTH = 100;
const MAX_TAG_SLUG_LENGTH = 80;

function normalizeTagNames(tagsValue) {
  if (!Array.isArray(tagsValue)) {
    return [];
  }

  const normalizedTagNames = tagsValue
    .map((tagValue) => {
      if (typeof tagValue === 'string') {
        return tagValue.trim();
      }

      if (tagValue && typeof tagValue.name === 'string') {
        return tagValue.name.trim();
      }

      return '';
    })
    .filter(Boolean);

  return Array.from(new Set(normalizedTagNames));
}

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
    tags: normalizeTagNames(row.tags),
    author: {
      id: row.author_id ?? null,
      name: row.author_name || 'Unknown Author',
      avatar_url: row.author_avatar_url || null,
    },
  }));
}

function mapTagRowsByPostId(tagRows) {
  const tagsByPostId = new Map();

  tagRows.forEach((tagRow) => {
    const postId = Number.parseInt(tagRow?.post_id, 10);
    const tagName = typeof tagRow?.name === 'string' ? tagRow.name.trim() : '';

    if (!Number.isInteger(postId) || !tagName) {
      return;
    }

    const existingTagNames = tagsByPostId.get(postId);
    if (!existingTagNames) {
      tagsByPostId.set(postId, [tagName]);
      return;
    }

    if (!existingTagNames.includes(tagName)) {
      existingTagNames.push(tagName);
    }
  });

  return tagsByPostId;
}

async function attachTagsToArticleRows(rows) {
  if (!Array.isArray(rows) || rows.length < 1) {
    return [];
  }

  const fallbackRows = rows.map((row) => ({
    ...row,
    tags: [],
  }));

  const postIds = rows
    .map((row) => Number.parseInt(row?.id, 10))
    .filter((postId) => Number.isInteger(postId));

  if (postIds.length < 1) {
    return fallbackRows;
  }

  try {
    const placeholders = postIds.map(() => '?').join(', ');
    const [tagRows] = await db.query(
      `SELECT
         pt.post_id,
         t.name
       FROM post_tags pt
       INNER JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id IN (${placeholders})
       ORDER BY t.name ASC`,
      postIds
    );

    const tagNamesByPostId = mapTagRowsByPostId(tagRows);

    return rows.map((row) => {
      const postId = Number.parseInt(row?.id, 10);
      const tagNames = Number.isInteger(postId) ? tagNamesByPostId.get(postId) ?? [] : [];

      return {
        ...row,
        tags: tagNames,
      };
    });
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return fallbackRows;
    }

    throw error;
  }
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

function normalizeTagSlug(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return normalizeSlug(value.trim().slice(0, MAX_TAG_SLUG_LENGTH));
}

function mapPublicTagRow(row) {
  const parsedId = Number.parseInt(row?.id, 10);
  const tagName = typeof row?.name === 'string' ? row.name.trim() : '';
  const tagSlug = normalizeTagSlug(row?.slug || tagName);

  return {
    id: Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null,
    name: tagName,
    slug: tagSlug,
    usage_count: Number.parseInt(row?.usage_count, 10) || 0,
  };
}

function normalizeNextArticle(row) {
  const parsedId = Number.parseInt(row?.id, 10);
  const title = typeof row?.title === 'string' ? row.title.trim() : '';
  const slug = normalizeSlug(row?.slug || title);

  if (!Number.isInteger(parsedId) || !title || !slug) {
    return null;
  }

  return {
    id: parsedId,
    title,
    slug,
  };
}

async function findNextPublishedArticle(currentArticle) {
  const currentPostId = Number.parseInt(currentArticle?.id, 10);
  if (!Number.isInteger(currentPostId)) {
    return null;
  }

  const currentSortDate = currentArticle?.published_at || currentArticle?.created_at;

  if (currentSortDate) {
    const [rows] = await db.query(
      `SELECT
         id,
         title,
         slug
       FROM posts
       WHERE LOWER(status) = 'published'
         AND id <> ?
         AND (
           COALESCE(published_at, created_at) < ?
           OR (COALESCE(published_at, created_at) = ? AND id < ?)
         )
       ORDER BY COALESCE(published_at, created_at) DESC, id DESC
       LIMIT 1`,
      [currentPostId, currentSortDate, currentSortDate, currentPostId]
    );

    const nextArticle = normalizeNextArticle(rows[0]);
    if (nextArticle) {
      return nextArticle;
    }
  }

  const [fallbackRows] = await db.query(
    `SELECT
       id,
       title,
       slug
     FROM posts
     WHERE LOWER(status) = 'published'
       AND id <> ?
     ORDER BY COALESCE(published_at, created_at) DESC, id DESC
     LIMIT 1`,
    [currentPostId]
  );

  return normalizeNextArticle(fallbackRows[0]);
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
    const articleRowsWithTags = await attachTagsToArticleRows(articleRows);
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
      featuredArticles: normalizeArticles(articleRowsWithTags),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load public homepage data',
      error: error.message,
    });
  }
}

async function getPublicTags(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
         t.id,
         t.name,
         t.slug,
         COUNT(DISTINCT pt.post_id) AS usage_count
       FROM tags t
       INNER JOIN post_tags pt ON pt.tag_id = t.id
       INNER JOIN posts p ON p.id = pt.post_id
       WHERE LOWER(p.status) = 'published'
       GROUP BY t.id, t.name, t.slug
       ORDER BY t.name ASC`
    );

    const normalizedTags = rows
      .map(mapPublicTagRow)
      .filter((tagRow) => tagRow.name && tagRow.slug && tagRow.usage_count > 0);

    return res.json({
      success: true,
      data: normalizedTags,
    });
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return res.json({
        success: true,
        data: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to load public tags',
      error: error.message,
    });
  }
}

async function listPublicArticles(req, res) {
  const requestedPage = toPositiveInteger(req.query.page, DEFAULT_ARTICLES_PAGE);
  const rawLimit = toPositiveInteger(req.query.limit, DEFAULT_ARTICLES_LIMIT);
  const limit = Math.min(rawLimit, MAX_ARTICLES_LIMIT);
  const searchQuery = normalizeSearchQuery(req.query.q);
  const rawTagValue = typeof req.query.tag === 'string' ? req.query.tag : '';
  const hasTagFilter = rawTagValue.trim().length > 0;
  const tagSlugFilter = normalizeTagSlug(rawTagValue);

  const whereClauses = [`LOWER(p.status) = 'published'`];
  const whereParams = [];

  if (searchQuery) {
    whereClauses.push('LOWER(p.title) LIKE ?');
    whereParams.push(`%${searchQuery.toLowerCase()}%`);
  }

  if (hasTagFilter && !tagSlugFilter) {
    whereClauses.push('1 = 0');
  } else if (tagSlugFilter) {
    whereClauses.push(
      `EXISTS (
         SELECT 1
         FROM post_tags pt_filter
         INNER JOIN tags t_filter ON t_filter.id = pt_filter.tag_id
         WHERE pt_filter.post_id = p.id
           AND t_filter.slug = ?
       )`
    );
    whereParams.push(tagSlugFilter);
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

    const rowsWithTags = await attachTagsToArticleRows(rows);

    return res.json({
      success: true,
      data: normalizeArticles(rowsWithTags),
      activeSearch: searchQuery,
      activeTag: tagSlugFilter,
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
    if (hasTagFilter && error?.code === 'ER_NO_SUCH_TABLE') {
      return res.json({
        success: true,
        data: [],
        activeSearch: searchQuery,
        activeTag: tagSlugFilter,
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
          hasPrev: false,
          hasNext: false,
        },
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to load public articles',
      error: error.message,
    });
  }
}

async function getPublicArticleBySlug(req, res) {
  const normalizedSlug = normalizeSlug(req.params.slug);

  if (!normalizedSlug) {
    return res.status(404).json({
      success: false,
      message: 'Article not found',
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         p.id,
         p.title,
         p.slug,
         p.excerpt,
         p.content,
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
         AND p.slug = ?
       LIMIT 1`,
      [normalizedSlug]
    );

    if (rows.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const [rowWithTags] = await attachTagsToArticleRows(rows);
    const [normalizedArticle] = normalizeArticles([rowWithTags]);
    const nextPost = await findNextPublishedArticle(rows[0]);

    return res.json({
      success: true,
      data: {
        ...normalizedArticle,
        content: typeof rows[0]?.content === 'string' ? rows[0].content : '',
        nextPost,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load article detail',
      error: error.message,
    });
  }
}

module.exports = {
  getHomeData,
  getPublicTags,
  listPublicArticles,
  getPublicArticleBySlug,
};
