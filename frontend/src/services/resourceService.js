import api from "./api";

function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function normalizeResource(resource = {}) {
  return {
    resource_id: resource.resource_id ?? resource.id,
    id: resource.id ?? resource.resource_id,
    name: resource.name ?? "",
    type: resource.type,
    capacity: resource.capacity,
    location: resource.location ?? "",
    availability: resource.availability ?? resource.availabilityWindows ?? "",
    availability_windows:
      resource.availability_windows ??
      resource.availabilityWindows ??
      resource.availability ??
      "",
    status: resource.status,
    description: resource.description ?? "",
    image_url: resource.image_url ?? resource.imageUrl,
    imageUrl: resource.imageUrl ?? resource.image_url,
    created_at: resource.created_at ?? resource.createdAt,
    updated_at: resource.updated_at ?? resource.updatedAt,
  };
}

function toApiPayload(data = {}) {
  const payload = { ...data };

  if (
    payload.availability !== undefined &&
    payload.availabilityWindows === undefined
  ) {
    payload.availabilityWindows = payload.availability;
  }
  if (payload.image_url !== undefined && payload.imageUrl === undefined) {
    payload.imageUrl = payload.image_url;
  }

  delete payload.resource_id;
  delete payload.availability;
  delete payload.availability_windows;
  delete payload.image_url;
  delete payload.created_at;
  delete payload.updated_at;

  return payload;
}

export const resourceService = {
  async getAll(params = {}) {
    const response = await api.get("/resources", { params });
    const data = unwrapData(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  async getById(id) {
    const response = await api.get(`/resources/${id}`);
    return normalizeResource(unwrapData(response));
  },

  async create(data) {
    const response = await api.post("/resources", toApiPayload(data));
    return normalizeResource(unwrapData(response));
  },

  async update(id, data) {
    const response = await api.put(`/resources/${id}`, toApiPayload(data));
    return normalizeResource(unwrapData(response));
  },

  async delete(id) {
    const response = await api.delete(`/resources/${id}`);
    return unwrapData(response);
  },
};
