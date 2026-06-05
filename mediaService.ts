// src/api/mediaService.ts
import axiosClient from './axiosClient';
import { MediaItem, ApiResponse } from 'src/types/media';

export const getMediaList = async (): Promise<MediaItem[]> => {
    // Gọi đến controller Media trong Backend
    const response = await axiosClient.get<ApiResponse<MediaItem[]>>('/media');
    return response.data.data;
};

export const streamMedia = (id: string): string => {
    // Trả về đường dẫn để thẻ <audio> hoặc <video> của bạn sử dụng
    return `https://localhost:7001/api/media/${id}/stream`;
};