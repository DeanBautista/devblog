const db = require('../config/db');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
const MAX_SEARCH_QUERY_LENGTH = 100;

function normalizeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function submitPost(req, res) {
  const userId = req.user?.sub;
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const slugInput = typeof req.body.slug === 'string' ? req.body.slug : '';
  const slug = normalizeSlug(slugInput) || normalizeSlug(title);
  const readingTime = Number.parseInt(req.body.reading_time, 10);

  const missingFields = [];

  if (!userId) missingFields.push('user');
  if (!title) missingFields.push('title');
  if (!slug) missingFields.push('slug');
  if (!excerpt) missingFields.push('excerpt');
  if (!content) missingFields.push('content');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  if (!Number.isInteger(readingTime) || readingTime <= 0) {
    return res.status(400).json({
      success: false,
      message: 'reading_time must be a positive integer',
    });
  }

  try {
    const [existingRows] = await db.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    const [result] = await db.query(
      `INSERT INTO posts (
        user_id,
        title,
        slug,
        excerpt,
        content,
        cover_image,
        status,
        reading_time,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        slug,
        excerpt,
        content,
        null,
        'published',
        readingTime,
        new Date(),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      post: {
        id: result.insertId,
        user_id: userId,
        title,
        slug,
        excerpt,
        content,
        cover_image: null,
        status: 'published',
        reading_time: readingTime,
      },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to publish post',
      error: error.message,
    });
  }
}

function toPositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallbackValue;
  }

  return parsedValue;
}

function normalizeStatusFilter(value) {
  const normalizedValue = String(value ?? 'all').trim().toLowerCase();

  if (normalizedValue === 'published') {
    return 'published';
  }

  if (normalizedValue === 'draft') {
    return 'draft';
  }

  return 'all';
}

function normalizeSearchQuery(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
}

async function listPosts(req, res) {
  const requestedPage = toPositiveInteger(req.query.page, DEFAULT_PAGE);
  const rawLimit = toPositiveInteger(req.query.limit, DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);
  const statusFilter = normalizeStatusFilter(req.query.status);
  const searchQuery = normalizeSearchQuery(req.query.q);
  const hasSearchQuery = searchQuery.length > 0;

  const whereClauses = [];
  const whereParams = [];

  if (statusFilter !== 'all') {
    whereClauses.push('LOWER(status) = ?');
    whereParams.push(statusFilter);
  }

  if (hasSearchQuery) {
    whereClauses.push('LOWER(title) LIKE ?');
    whereParams.push(`%${searchQuery.toLowerCase()}%`);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM posts
    ${whereClause}
  `;

  const listQuery = `
    SELECT
      id,
      title,
      status,
      views,
      reading_time,
      published_at,
      created_at,
      cover_image
    FROM posts
    ${whereClause}
    ORDER BY COALESCE(published_at, created_at) DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const [countRows] = await db.query(countQuery, whereParams);
    const total = countRows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * limit;

    const listParams = [...whereParams, limit, offset];
    const [rows] = await db.query(listQuery, listParams);

    return res.json({
      success: true,
      data: rows,
      activeFilter: statusFilter,
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
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load posts',
      error: err.message,
    });
  }
}

async function deletePost(req, res) {
  const userId = req.user?.sub;
  const postId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(postId) || postId < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid post id',
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, user_id FROM posts WHERE id = ? LIMIT 1',
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (String(rows[0].user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this post',
      });
    }

    await db.query('DELETE FROM posts WHERE id = ? LIMIT 1', [postId]);

    return res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: err.message,
    });
  }
}

module.exports = {
  submitPost,
  listPosts,
  deletePost,
};
