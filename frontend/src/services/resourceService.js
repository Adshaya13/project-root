import api from './api';

const unwrapApiData = (response) => {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
};

const toClientResource = (resource) => {
  if (!resource || typeof resource !== 'object') {
    return resource;
  }

  return {
    ...resource,
    resource_id: resource.resource_id ?? resource.id,
    image_url: resource.image_url ?? resource.imageUrl ?? '',
    availability: resource.availability ?? resource.availabilityWindows ?? '',
  };
};

const toServerResource = (resource) => {
  if (!resource || typeof resource !== 'object') {
    return resource;
  }

  return {
    name: resource.name,
    type: resource.type,
    capacity: resource.capacity,
    location: resource.location,
    availabilityWindows: resource.availabilityWindows ?? resource.availability ?? '',
    status: resource.status,
    description: resource.description,
    imageUrl: resource.imageUrl ?? resource.image_url ?? '',
  };
};

export const resourceService = {
  async getAll(params = {}) {
    const response = await api.get('/resources', { params });
    const data = unwrapApiData(response);
    return Array.isArray(data) ? data.map(toClientResource) : [];
  },

  async getById(id) {
    const response = await api.get(`/resources/${id}`);
    return toClientResource(unwrapApiData(response));
  },

  async create(data) {
    const response = await api.post('/resources', toServerResource(data));
    return toClientResource(unwrapApiData(response));
  },

  async update(id, data) {
    const response = await api.put(`/resources/${id}`, toServerResource(data));
    return toClientResource(unwrapApiData(response));
  },

  async delete(id) {
    const response = await api.delete(`/resources/${id}`);
    return unwrapApiData(response);
  },
};
