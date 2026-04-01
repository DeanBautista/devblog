import api from "./axios";

export async function getAdminTags({ page = 1, limit = 8, q = "" } = {}) {
    const params = { page, limit };

    if (typeof q === "string" && q.trim()) {
        params.q = q.trim();
    }

    const response = await api.get("/api/tags", { params });
    return response.data;
}

export async function createAdminTag({ name, slug }) {
    const response = await api.post("/api/tags", {
        name,
        slug,
    });

    return response.data;
}

export async function updateAdminTag(tagId, { name, slug }) {
    const response = await api.put(`/api/tags/${tagId}`, {
        name,
        slug,
    });

    return response.data;
}

export async function deleteAdminTag(tagId) {
    const response = await api.delete(`/api/tags/${tagId}`);
    return response.data;
}

export async function getAdminTagPosts(tagId, { page = 1, limit = 5, q = "" } = {}) {
    const params = { page, limit };

    if (typeof q === "string" && q.trim()) {
        params.q = q.trim();
    }

    const response = await api.get(`/api/tags/${tagId}/posts`, { params });
    return response.data;
}
