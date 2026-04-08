const API_BASE = 'https://api.solian.app/sphere';

export interface Post {
  id: string;
  title: string;
  content: string;
  published_at: string;
  edited_at: string | null;
  publisher: {
    id: string;
    name: string;
    nick: string;
    picture: {
      id: string;
      file_meta: {
        blur: string;
      };
    } | null;
  };
  attachments: Array<{
    id: string;
    name: string;
    file_meta: {
      mime_type: string;
      width: number;
      height: number;
      blur: string;
    };
  }>;
  reactions_count: Record<string, number>;
  views_unique: number;
  views_total: number;
  replies_count: number;
}

export async function getPosts(take = 10, skip = 0): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE}/posts?take=${take}&skip=${skip}&pub=solsynth`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Post[];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_BASE}/posts/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Post;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function truncateContent(content: string, maxLength = 150): string {
  if (!content || content.length <= maxLength) return content || '';
  return content.substring(0, maxLength).trim() + '...';
}

export function getAttachmentUrl(attachmentId: string): string {
  return `https://api.solian.app/drive/files/${attachmentId}`;
}