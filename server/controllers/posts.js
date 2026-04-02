const db = require('../config/db');
const { normalizeSlug } = require('../utils/slug');
const { withTransaction } = require('../utils/withTransaction');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;
const MAX_SEARCH_QUERY_LENGTH = 100;
const MIN_TAG_IDS = 1;
const MAX_TAG_IDS = 2;
const POST_STATUS_PUBLISHED = 'published';
const POST_STATUS_DRAFT = 'draft';

function normalizeSubmissionStatus(value) {
  const normalizedValue = String(value ?? POST_STATUS_PUBLISHED).trim().toLowerCase();
  return normalizedValue === POST_STATUS_DRAFT ? POST_STATUS_DRAFT : POST_STATUS_PUBLISHED;
}

function buildDraftSlug() {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `draft-${timestamp}-${randomSuffix}`;
}

function normalizeTagIds(value) {
  if (value == null) {
    return {
      tagIds: [],
      hasInvalidValue: false,
      exceedsLimit: false,
    };
  }

  if (!Array.isArray(value)) {
    return {
      tagIds: [],
      hasInvalidValue: true,
      exceedsLimit: false,
    };
  }

  const parsedTagIds = value.map((tagId) => Number.parseInt(tagId, 10));
  const hasInvalidValue = parsedTagIds.some((tagId) => !Number.isInteger(tagId) || tagId < 1);

  if (hasInvalidValue) {
    return {
      tagIds: [],
      hasInvalidValue: true,
      exceedsLimit: false,
    };
  }

  const uniqueTagIds = Array.from(new Set(parsedTagIds));

  return {
    tagIds: uniqueTagIds,
    hasInvalidValue: false,
    exceedsLimit: uniqueTagIds.length > MAX_TAG_IDS,
  };
}

async function submitPost(req, res) {
  const userId = req.user?.sub;
  const submissionStatus = normalizeSubmissionStatus(req.body.status);
  const isPublishing = submissionStatus === POST_STATUS_PUBLISHED;
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const excerpt = typeof req.body.excerpt === 'string' ? req.body.excerpt.trim() : '';
  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
  const slugInput = typeof req.body.slug === 'string' ? req.body.slug : '';
  const resolvedSlug = normalizeSlug(slugInput) || normalizeSlug(title);
  const slug = resolvedSlug || (isPublishing ? '' : buildDraftSlug());
  const readingTime = Number.parseInt(req.body.reading_time, 10);
  const normalizedReadingTime =
    Number.isInteger(readingTime) && readingTime > 0
      ? readingTime
      : isPublishing
      ? Number.NaN
      : 1;
  const normalizedTagIds = normalizeTagIds(req.body.tag_ids);
  const { tagIds } = normalizedTagIds;

  const missingFields = [];

  if (!userId) missingFields.push('user');

  if (isPublishing) {
    if (!title) missingFields.push('title');
    if (!slug) missingFields.push('slug');
    if (!excerpt) missingFields.push('excerpt');
    if (!content) missingFields.push('content');
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  if (!Number.isInteger(normalizedReadingTime) || normalizedReadingTime <= 0) {
    return res.status(400).json({
      success: false,
      message: 'reading_time must be a positive integer',
    });
  }

  if (normalizedTagIds.hasInvalidValue) {
    return res.status(400).json({
      success: false,
      message: 'tag_ids must be an array of positive integer ids',
    });
  }

  if (isPublishing && tagIds.length < MIN_TAG_IDS) {
    return res.status(400).json({
      success: false,
      message: `A post must have at least ${MIN_TAG_IDS} tag`,
    });
  }

  if (normalizedTagIds.exceedsLimit) {
    return res.status(400).json({
      success: false,
      message: `A post can have up to ${MAX_TAG_IDS} tags`,
    });
  }

  try {
    if (tagIds.length > 0) {
      const placeholders = tagIds.map(() => '?').join(', ');
      const [tagRows] = await db.query(`SELECT id FROM tags WHERE id IN (${placeholders})`, tagIds);

      if (tagRows.length !== tagIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more tag_ids are invalid',
        });
      }
    }

    const [existingRows] = await db.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    const createdPostId = await withTransaction(db, async (connection) => {
      const [insertResult] = await connection.query(
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
          submissionStatus,
          normalizedReadingTime,
          isPublishing ? new Date() : null,
        ]
      );

      if (tagIds.length > 0) {
        const valuePlaceholders = tagIds.map(() => '(?, ?)').join(', ');
        const relationParams = [];

        tagIds.forEach((tagId) => {
          relationParams.push(insertResult.insertId, tagId);
        });

        await connection.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ${valuePlaceholders}`,
          relationParams
        );
      }

      return insertResult.insertId;
    });

    const successMessage = isPublishing
      ? 'Post published successfully.'
      : 'Post draft saved successfully.';

    return res.status(201).json({
      success: true,
      message: successMessage,
      post: {
        id: createdPostId,
        user_id: userId,
        title,
        slug,
        excerpt,
        content,
        cover_image: null,
        status: submissionStatus,
        reading_time: normalizedReadingTime,
        tag_ids: tagIds,
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
      message: isPublishing ? 'Failed to publish post' : 'Failed to save draft post',
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
    let rowsWithTags = rows.map((row) => ({
      ...row,
      tags: [],
    }));

    const postIds = rows
      .map((row) => Number.parseInt(row?.id, 10))
      .filter((postId) => Number.isInteger(postId));

    if (postIds.length > 0) {
      try {
        const postIdPlaceholders = postIds.map(() => '?').join(', ');
        const [tagRows] = await db.query(
          `SELECT
             pt.post_id,
             t.name
           FROM post_tags pt
           INNER JOIN tags t ON t.id = pt.tag_id
           WHERE pt.post_id IN (${postIdPlaceholders})
           ORDER BY t.name ASC`,
          postIds
        );

        const tagNamesByPostId = mapTagRowsByPostId(tagRows);

        rowsWithTags = rows.map((row) => {
          const postId = Number.parseInt(row?.id, 10);
          const tagNames = Number.isInteger(postId) ? tagNamesByPostId.get(postId) ?? [] : [];

          return {
            ...row,
            tags: tagNames,
          };
        });
      } catch (tagError) {
        if (tagError?.code !== 'ER_NO_SUCH_TABLE') {
          throw tagError;
        }
      }
    }

    return res.json({
      success: true,
      data: rowsWithTags,
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
