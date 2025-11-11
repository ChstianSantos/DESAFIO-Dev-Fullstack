import axios from "axios";

const API_URL = "http://localhost:5152/api/media";

export interface Media {
  id?: number;
  title: string;
  description: string;
  url: string;
}

export const getAllMedia = async (): Promise<Media[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createMedia = async (media: Media): Promise<Media> => {
  const response = await axios.post(API_URL, media);
  return response.data;
};

export const updateMedia = async (id: number, media: Media): Promise<Media> => {
  const response = await axios.put(`${API_URL}/${id}`, media);
  return response.data;
};

export const deleteMedia = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
