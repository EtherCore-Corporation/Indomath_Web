export interface BunnyVideo {
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  thumbnailFileName: string;
  averageWatchTime: number;
  playCount: number;
  isMP4Available: boolean;
  storageSize: number;
  captions: unknown[];
  metaTags: unknown[];
  chapters: unknown[];
  moments: unknown[];
  metaData: unknown[];
}

export interface BunnyLibrary {
  id: number;
  name: string;
  videos: BunnyVideo[];
}

export class BunnyService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://video.bunnycdn.com/library';
  }

  /**
   * Get all videos from a specific library
   */
  async getLibraryVideos(libraryId: string): Promise<BunnyVideo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${libraryId}/videos`, {
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching library videos:', error);
      throw error;
    }
  }

  /**
   * Get a specific video by ID
   */
  async getVideo(libraryId: string, videoId: string): Promise<BunnyVideo> {
    try {
      const response = await fetch(`${this.baseUrl}/${libraryId}/videos/${videoId}`, {
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  /**
   * Get video embed URL
   */
  getVideoEmbedUrl(libraryId: string, videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
  }

  /**
   * Get video stream URL
   */
  getVideoStreamUrl(libraryId: string, videoId: string): string {
    return `https://video.bunnycdn.com/stream/${libraryId}/${videoId}/play.mp4`;
  }

  /**
   * Match video titles with Bunny.net videos
   */
  async matchVideosWithBunny(
    libraryId: string, 
    expectedVideos: Array<{ title: string; duration: string }>
  ): Promise<Array<{ title: string; duration: string; bunnyVideoId: string }>> {
    try {
      const bunnyVideos = await this.getLibraryVideos(libraryId);
      const matchedVideos = [];

      for (const expectedVideo of expectedVideos) {
        // Try to find exact match by title
        let matchedVideo = bunnyVideos.find(bv => 
          bv.title.toLowerCase().trim() === expectedVideo.title.toLowerCase().trim()
        );

        // If no exact match, try partial match
        if (!matchedVideo) {
          matchedVideo = bunnyVideos.find(bv => 
            bv.title.toLowerCase().includes(expectedVideo.title.toLowerCase()) ||
            expectedVideo.title.toLowerCase().includes(bv.title.toLowerCase())
          );
        }

        if (matchedVideo) {
          matchedVideos.push({
            title: expectedVideo.title,
            duration: expectedVideo.duration,
            bunnyVideoId: matchedVideo.guid
          });
          console.log(`✅ Matched: "${expectedVideo.title}" -> "${matchedVideo.title}" (${matchedVideo.guid})`);
        } else {
          console.warn(`⚠️ No match found for: "${expectedVideo.title}"`);
          matchedVideos.push({
            title: expectedVideo.title,
            duration: expectedVideo.duration,
            bunnyVideoId: ''
          });
        }
      }

      return matchedVideos;
    } catch (error) {
      console.error('Error matching videos:', error);
      throw error;
    }
  }
} 