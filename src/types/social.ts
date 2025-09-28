// Social feature types for post composer and interactions

export interface PostContent {
  text: string;
  postType: 'text' | 'image' | 'video' | 'listing_share' | 'trip_update';
  mediaUrls?: string[];
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  listingId?: string;
  bookingId?: string;
}

export interface PostComposerProps {
  onPost: (content: PostContent) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  allowMedia?: boolean;
  allowLocation?: boolean;
  initialContent?: Partial<PostContent>;
}

export interface MediaAttachment {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
}

export interface LocationData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
}