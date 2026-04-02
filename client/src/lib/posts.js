import api from "./axios";

export async function getAdminPosts({ page = 1, limit = 5, status = "all", q = "" } = {}) {
    const params = { page, limit, status };

    if (typeof q === "string" && q.trim()) {
        params.q = q.trim();
    }

    const response = await api.get("/api/posts", { params });
    return response.data;
}

export async function getAdminPostBySlug(slug) {
    const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

    if (!normalizedSlug) {
        throw new Error("Post slug is required");
    }

    const response = await api.get(`/api/posts/slug/${encodeURIComponent(normalizedSlug)}`);
    return response.data;
}

export async function getAdminPostById(postId) {
    const parsedPostId = Number.parseInt(postId, 10);

    if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
        throw new Error("Valid post id is required");
    }

    const response = await api.get(`/api/posts/${parsedPostId}`);
    return response.data;
}

export async function createAdminPost(payload) {
    const response = await api.post("/api/posts/submitpost", payload);
    return response.data;
}

export async function updateAdminPost(postId, payload) {
    const parsedPostId = Number.parseInt(postId, 10);

    if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
        throw new Error("Valid post id is required");
    }

    const response = await api.put(`/api/posts/${parsedPostId}`, payload);
    return response.data;
}

export async function deleteAdminPost(postId) {
    const parsedPostId = Number.parseInt(postId, 10);

    if (!Number.isInteger(parsedPostId) || parsedPostId < 1) {
        throw new Error("Valid post id is required");
    }

    const response = await api.delete(`/api/posts/${parsedPostId}`);
    return response.data;
}
