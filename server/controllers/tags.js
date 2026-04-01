const db = require('../config/db');
const { normalizeSlug } = require('../utils/slug');
const { withTransaction } = require('../utils/withTransaction');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;
const DEFAULT_POSTS_LIMIT = 5;
const MAX_POSTS_LIMIT = 20;
const MAX_SEARCH_QUERY_LENGTH = 100;
const MAX_TAG_NAME_LENGTH = 50;

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

function normalizeTagName(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, MAX_TAG_NAME_LENGTH);
}

function normalizeTagId(value) {
  const parsedId = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null;
  }

  return parsedId;
}

function resolveTagSlug(slugInput, tagName) {
  const normalizedInput = typeof slugInput === 'string' ? slugInput : '';
  return normalizeSlug(normalizedInput) || normalizeSlug(tagName);
}

function mapTagRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    usage_count: Number.parseInt(row.usage_count, 10) || 0,
  };
}

function mapTagPostRow(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    reading_time: Number.parseInt(row.reading_time, 10) || 0,
    views: Number.parseInt(row.views, 10) || 0,
    published_at: row.published_at,
    created_at: row.created_at,
  };
}

async function listTags(req, res) {
  const requestedPage = toPositiveInteger(req.query.page, DEFAULT_PAGE);
  const rawLimit = toPositiveInteger(req.query.limit, DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const searchQuery = normalizeSearchQuery(req.query.q);

  const whereClauses = [];
  const whereParams = [];

  if (searchQuery) {
    whereClauses.push('(LOWER(t.name) LIKE ? OR LOWER(t.slug) LIKE ?)');
    whereParams.push(`%${searchQuery.toLowerCase()}%`, `%${searchQuery.toLowerCase()}%`);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM tags t
       ${whereClause}`,
      whereParams
    );

    const total = Number.parseInt(countRows[0]?.total, 10) || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT
         t.id,
         t.name,
         t.slug,
         COUNT(DISTINCT pt.post_id) AS usage_count
       FROM tags t
       LEFT JOIN post_tags pt ON pt.tag_id = t.id
       ${whereClause}
       GROUP BY t.id, t.name, t.slug
       ORDER BY usage_count DESC, t.name ASC
       LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    return res.json({
      success: true,
      data: rows.map(mapTagRow),
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
      message: 'Failed to load tags',
      error: error.message,
    });
  }
}

async function createTag(req, res) {
  const tagName = normalizeTagName(req.body.name);
  const tagSlug = resolveTagSlug(req.body.slug, tagName);

  if (!tagName || !tagSlug) {
    return res.status(400).json({
      success: false,
      message: 'Tag name and slug are required',
    });
  }

  try {
    const [slugRows] = await db.query('SELECT id FROM tags WHERE slug = ? LIMIT 1', [tagSlug]);
    if (slugRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tag slug already exists. Please choose a different slug.',
      });
    }

    const [nameRows] = await db.query('SELECT id FROM tags WHERE LOWER(name) = LOWER(?) LIMIT 1', [tagName]);
    if (nameRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tag name already exists. Please choose a different name.',
      });
    }

    const [result] = await db.query(
      'INSERT INTO tags (name, slug) VALUES (?, ?)',
      [tagName, tagSlug]
    );

    return res.status(201).json({
      success: true,
      message: 'Tag created successfully.',
      data: {
        id: result.insertId,
        name: tagName,
        slug: tagSlug,
        usage_count: 0,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Tag name or slug already exists. Please choose different values.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message,
    });
  }
}

async function updateTag(req, res) {
  const tagId = normalizeTagId(req.params.id);

  if (!tagId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tag id',
    });
  }

  const tagName = normalizeTagName(req.body.name);
  const tagSlug = resolveTagSlug(req.body.slug, tagName);

  if (!tagName || !tagSlug) {
    return res.status(400).json({
      success: false,
      message: 'Tag name and slug are required',
    });
  }

  try {
    const [tagRows] = await db.query('SELECT id FROM tags WHERE id = ? LIMIT 1', [tagId]);

    if (tagRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    const [slugRows] = await db.query(
      'SELECT id FROM tags WHERE slug = ? AND id <> ? LIMIT 1',
      [tagSlug, tagId]
    );

    if (slugRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tag slug already exists. Please choose a different slug.',
      });
    }

    const [nameRows] = await db.query(
      'SELECT id FROM tags WHERE LOWER(name) = LOWER(?) AND id <> ? LIMIT 1',
      [tagName, tagId]
    );

    if (nameRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tag name already exists. Please choose a different name.',
      });
    }

    await db.query('UPDATE tags SET name = ?, slug = ? WHERE id = ? LIMIT 1', [tagName, tagSlug, tagId]);

    const [usageRows] = await db.query(
      'SELECT COUNT(DISTINCT post_id) AS usage_count FROM post_tags WHERE tag_id = ?',
      [tagId]
    );

    return res.json({
      success: true,
      message: 'Tag updated successfully.',
      data: {
        id: tagId,
        name: tagName,
        slug: tagSlug,
        usage_count: Number.parseInt(usageRows[0]?.usage_count, 10) || 0,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Tag name or slug already exists. Please choose different values.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message,
    });
  }
}

async function deleteTag(req, res) {
  const tagId = normalizeTagId(req.params.id);

  if (!tagId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tag id',
    });
  }

  try {
    const [tagRows] = await db.query('SELECT id FROM tags WHERE id = ? LIMIT 1', [tagId]);

    if (tagRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    const detachedCount = await withTransaction(db, async (connection) => {
      const [detachResult] = await connection.query('DELETE FROM post_tags WHERE tag_id = ?', [tagId]);
      await connection.query('DELETE FROM tags WHERE id = ? LIMIT 1', [tagId]);
      return detachResult.affectedRows;
    });

    return res.json({
      success: true,
      message: 'Tag deleted successfully.',
      detached_links: detachedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete tag',
      error: error.message,
    });
  }
}

async function listTagPosts(req, res) {
  const tagId = normalizeTagId(req.params.id);

  if (!tagId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid tag id',
    });
  }

  const requestedPage = toPositiveInteger(req.query.page, DEFAULT_PAGE);
  const rawLimit = toPositiveInteger(req.query.limit, DEFAULT_POSTS_LIMIT);
  const limit = Math.min(rawLimit, MAX_POSTS_LIMIT);
  const searchQuery = normalizeSearchQuery(req.query.q);

  try {
    const [tagRows] = await db.query('SELECT id, name, slug FROM tags WHERE id = ? LIMIT 1', [tagId]);

    if (tagRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    const whereClauses = ['pt.tag_id = ?'];
    const whereParams = [tagId];

    if (searchQuery) {
      whereClauses.push('LOWER(p.title) LIKE ?');
      whereParams.push(`%${searchQuery.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM post_tags pt
       INNER JOIN posts p ON p.id = pt.post_id
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
         p.status,
         p.reading_time,
         COALESCE(p.views, 0) AS views,
         p.published_at,
         p.created_at
       FROM post_tags pt
       INNER JOIN posts p ON p.id = pt.post_id
       ${whereClause}
       ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [...whereParams, limit, offset]
    );

    return res.json({
      success: true,
      tag: {
        id: tagRows[0].id,
        name: tagRows[0].name,
        slug: tagRows[0].slug,
      },
      data: rows.map(mapTagPostRow),
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
      message: 'Failed to load posts for tag',
      error: error.message,
    });
  }
}

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  listTagPosts,
};
