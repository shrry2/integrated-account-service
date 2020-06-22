import api from '../../utils/api';

const baseURL = '/_/client/dashboard/profile/';

export const updateDisplayName = (displayName) => api.put(`${baseURL}display-name`, {
  displayName,
});

export const loadDisplayNameHistory = (limit, cursor) => api.get(`${baseURL}display-name/history`, {
  limit,
  cursor,
});

export const deleteDisplayNameHistory = (id) => api.delete(`${baseURL}display-name/${id}`);

export const loadProfilePictureLibrary = () => api.get(`${baseURL}profile-picture/library`);

export const selectFromPictureLibrary = (id) => api.post(`${baseURL}profile-picture/select`, { id });

export const deleteProfilePictureLibrary = (id) => api.delete(`${baseURL}profile-picture/${id}`);

export const uploadProfilePicture = (profilePicture, crop) => api.uploadImageWithCropData(`${baseURL}profile-picture`, profilePicture, crop);

export default {
  updateDisplayName,
  loadDisplayNameHistory,
  deleteDisplayNameHistory,
  loadProfilePictureLibrary,
  selectFromPictureLibrary,
  deleteProfilePictureLibrary,
  uploadProfilePicture,
};
