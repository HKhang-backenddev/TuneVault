
export interface MediaItem {
    id: string;
    title: string;
    artist: string;
    filePath: string;
    duration: number;
    ownerId: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    errors: string[];
}