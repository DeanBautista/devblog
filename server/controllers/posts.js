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

const EDITABLE_POST_SELECT = `
  SELECT
    id,
    user_id,
    title,
    slug,
    excerpt,
    content,
    cover_image,
    status,
    reading_time,
    published_at,
    created_at,
    updated_at
  FROM posts
`;

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

function parsePostId(value) {
  const parsedPostId = Number.parseInt(value, 10);
  if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
    return null;
  }

  return parsedPostId;
}

function collectMissingFields({ userId, isPublishing, title, slug, excerpt, content }) {
  const missingFields = [];

  if (!userId) {
    missingFields.push('user');
  }

  if (isPublishing) {
    if (!title) missingFields.push('title');
    if (!slug) missingFields.push('slug');
    if (!excerpt) missingFields.push('excerpt');
    if (!content) missingFields.push('content');
  }

  return missingFields;
}

function normalizePostPayload(body, fallbackSlug = '') {
  const submissionStatus = normalizeSubmissionStatus(body?.status);
  const isPublishing = submissionStatus === POST_STATUS_PUBLISHED;
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const excerpt = typeof body?.excerpt === 'string' ? body.excerpt.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const slugInput = typeof body?.slug === 'string' ? body.slug : '';
  const resolvedSlug = normalizeSlug(slugInput) || normalizeSlug(title);
  const normalizedFallbackSlug = normalizeSlug(fallbackSlug);
  const slug = resolvedSlug || normalizedFallbackSlug || (isPublishing ? '' : buildDraftSlug());

  const readingTime = Number.parseInt(body?.reading_time, 10);
  const normalizedReadingTime =
    Number.isInteger(readingTime) && readingTime > 0
      ? readingTime
      : isPublishing
      ? Number.NaN
      : 1;

  const normalizedTagIds = normalizeTagIds(body?.tag_ids);

  return {
    submissionStatus,
    isPublishing,
    title,
    excerpt,
    content,
    slug,
    normalizedReadingTime,
    normalizedTagIds,
    tagIds: normalizedTagIds.tagIds,
  };
}

async function ensureTagIdsExist(tagIds) {
  if (!Array.isArray(tagIds) || tagIds.length < 1) {
    return true;
  }

  const placeholders = tagIds.map(() => '?').join(', ');
  const [tagRows] = await db.query(`SELECT id FROM tags WHERE id IN (${placeholders})`, tagIds);

  return tagRows.length === tagIds.length;
}

async function hasSlugConflict(slug, excludePostId = null) {
  if (!slug) {
    return false;
  }

  if (excludePostId == null) {
    const [existingRows] = await db.query('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);
    return existingRows.length > 0;
  }

  const [existingRows] = await db.query(
    'SELECT id FROM posts WHERE slug = ? AND id <> ? LIMIT 1',
    [slug, excludePostId]
  );

  return existingRows.length > 0;
}

async function fetchPostTagIds(postId) {
  try {
    const [tagRows] = await db.query(
      `SELECT tag_id
       FROM post_tags
       WHERE post_id = ?
       ORDER BY tag_id ASC`,
      [postId]
    );

    return tagRows
      .map((tagRow) => Number.parseInt(tagRow?.tag_id, 10))
      .filter((tagId) => Number.isInteger(tagId) && tagId > 0);
  } catch (error) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return [];
    }

    throw error;
  }
}

function buildEditablePostData(row, tagIds) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: typeof row?.title === 'string' ? row.title : '',
    slug: typeof row?.slug === 'string' ? row.slug : '',
    excerpt: typeof row?.excerpt === 'string' ? row.excerpt : '',
    content: typeof row?.content === 'string' ? row.content : '',
    cover_image: row?.cover_image ?? null,
    status: normalizeSubmissionStatus(row?.status),
    reading_time: Number.parseInt(row?.reading_time, 10) || 1,
    tag_ids: Array.isArray(tagIds) ? tagIds : [],
    published_at: row?.published_at ?? null,
    created_at: row?.created_at ?? null,
    updated_at: row?.updated_at ?? null,
  };
}

async function getPostById(req, res) {
  const userId = req.user?.sub;
  const postId = parsePostId(req.params.id);

  if (postId == null) {
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
    const [rows] = await db.query(`${EDITABLE_POST_SELECT} WHERE id = ? LIMIT 1`, [postId]);

    if (rows.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const ownedPost = rows[0];

    if (String(ownedPost.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this post',
      });
    }

    const tagIds = await fetchPostTagIds(postId);

    return res.json({
      success: true,
      data: buildEditablePostData(ownedPost, tagIds),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load post detail',
      error: error.message,
    });
  }
}

async function getPostBySlug(req, res) {
  const userId = req.user?.sub;
  const normalizedSlug = normalizeSlug(req.params.slug);

  if (!normalizedSlug) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  try {
    const [rows] = await db.query(`${EDITABLE_POST_SELECT} WHERE slug = ? LIMIT 1`, [normalizedSlug]);

    if (rows.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const ownedPost = rows[0];

    if (String(ownedPost.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this post',
      });
    }

    const tagIds = await fetchPostTagIds(ownedPost.id);

    return res.json({
      success: true,
      data: buildEditablePostData(ownedPost, tagIds),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load post detail',
      error: error.message,
    });
  }
}

async function submitPost(req, res) {
  const userId = req.user?.sub;
  const {
    submissionStatus,
    isPublishing,
    title,
    excerpt,
    content,
    slug,
    normalizedReadingTime,
    normalizedTagIds,
    tagIds,
  } = normalizePostPayload(req.body);

  const missingFields = collectMissingFields({
    userId,
    isPublishing,
    title,
    slug,
    excerpt,
    content,
  });

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
    const hasValidTagIds = await ensureTagIdsExist(tagIds);

    if (!hasValidTagIds) {
      return res.status(400).json({
        success: false,
        message: 'One or more tag_ids are invalid',
      });
    }

    const slugConflict = await hasSlugConflict(slug);

    if (slugConflict) {
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

async function updatePost(req, res) {
  const userId = req.user?.sub;
  const postId = parsePostId(req.params.id);

  if (postId == null) {
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
      `SELECT id, user_id, slug, published_at
       FROM posts
       WHERE id = ?
       LIMIT 1`,
      [postId]
    );

    if (rows.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const existingPost = rows[0];

    if (String(existingPost.user_id) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this post',
      });
    }

    const {
      submissionStatus,
      isPublishing,
      title,
      excerpt,
      content,
      slug,
      normalizedReadingTime,
      normalizedTagIds,
      tagIds,
    } = normalizePostPayload(req.body, existingPost.slug);

    const missingFields = collectMissingFields({
      userId,
      isPublishing,
      title,
      slug,
      excerpt,
      content,
    });

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

    const hasValidTagIds = await ensureTagIdsExist(tagIds);

    if (!hasValidTagIds) {
      return res.status(400).json({
        success: false,
        message: 'One or more tag_ids are invalid',
      });
    }

    const slugConflict = await hasSlugConflict(slug, postId);

    if (slugConflict) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    const nextPublishedAt = isPublishing
      ? existingPost.published_at || new Date()
      : existingPost.published_at;

    const updatedPost = await withTransaction(db, async (connection) => {
      await connection.query(
        `UPDATE posts
         SET
           title = ?,
           slug = ?,
           excerpt = ?,
           content = ?,
           cover_image = ?,
           status = ?,
           reading_time = ?,
           published_at = ?
         WHERE id = ?
         LIMIT 1`,
        [
          title,
          slug,
          excerpt,
          content,
          null,
          submissionStatus,
          normalizedReadingTime,
          nextPublishedAt,
          postId,
        ]
      );

      await connection.query('DELETE FROM post_tags WHERE post_id = ?', [postId]);

      if (tagIds.length > 0) {
        const valuePlaceholders = tagIds.map(() => '(?, ?)').join(', ');
        const relationParams = [];

        tagIds.forEach((tagId) => {
          relationParams.push(postId, tagId);
        });

        await connection.query(
          `INSERT INTO post_tags (post_id, tag_id) VALUES ${valuePlaceholders}`,
          relationParams
        );
      }

      const [updatedRows] = await connection.query(
        'SELECT updated_at, published_at FROM posts WHERE id = ? LIMIT 1',
        [postId]
      );

      return updatedRows[0] ?? null;
    });

    const successMessage = isPublishing
      ? 'Post updated and published successfully.'
      : 'Post draft updated successfully.';

    return res.json({
      success: true,
      message: successMessage,
      post: {
        id: postId,
        user_id: userId,
        title,
        slug,
        excerpt,
        content,
        cover_image: null,
        status: submissionStatus,
        reading_time: normalizedReadingTime,
        tag_ids: tagIds,
        published_at: updatedPost?.published_at ?? nextPublishedAt ?? null,
        updated_at: updatedPost?.updated_at ?? null,
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
      message: 'Failed to update post',
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
      slug,
      status,
      views,
      reading_time,
      published_at,
      created_at,
      updated_at,
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
    await withTransaction(db, async (connection) => {
      const [rows] = await connection.query(
        'SELECT id, user_id FROM posts WHERE id = ? LIMIT 1',
        [postId]
      );

      if (rows.length === 0) {
        const notFoundError = new Error('Post not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (String(rows[0].user_id) !== String(userId)) {
        const forbiddenError = new Error('You are not allowed to delete this post');
        forbiddenError.statusCode = 403;
        throw forbiddenError;
      }

      await connection.query('DELETE FROM post_tags WHERE post_id = ?', [postId]);
      await connection.query('DELETE FROM posts WHERE id = ? LIMIT 1', [postId]);
    });

    return res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    if (err && (err.statusCode === 404 || err.statusCode === 403)) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: err.message,
    });
  }
}

module.exports = {
  submitPost,
  getPostById,
  getPostBySlug,
  updatePost,
  listPosts,
  deletePost,
};
