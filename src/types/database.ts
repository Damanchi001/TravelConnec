// Database types - will be generated/updated when Supabase schema is created

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          user_type: 'traveler' | 'host' | 'both';
          is_verified: boolean;
          phone_number: string | null;
          date_of_birth: string | null;
          bio: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          user_type?: 'traveler' | 'host' | 'both';
          is_verified?: boolean;
          phone_number?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          user_type?: 'traveler' | 'host' | 'both';
          is_verified?: boolean;
          phone_number?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string;
          property_type: string;
          max_guests: number;
          bedrooms: number;
          bathrooms: number;
          price_per_night: number;
          currency: string;
          address: string;
          city: string;
          country: string;
          latitude: number | null;
          longitude: number | null;
          amenities: string[];
          images: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description: string;
          property_type: string;
          max_guests: number;
          bedrooms: number;
          bathrooms: number;
          price_per_night: number;
          currency?: string;
          address: string;
          city: string;
          country: string;
          latitude?: number | null;
          longitude?: number | null;
          amenities?: string[];
          images?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string;
          property_type?: string;
          max_guests?: number;
          bedrooms?: number;
          bathrooms?: number;
          price_per_night?: number;
          currency?: string;
          address?: string;
          city?: string;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          amenities?: string[];
          images?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      // More tables will be added as we progress
    };
  };
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Listing = Database['public']['Tables']['listings']['Row'];