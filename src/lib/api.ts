// Small API client wrapper for the backend endpoints used by the frontend
import config from './config';

const API_BASE_URL = config.apiUrl;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  reorder_level: number;
  in_stock: number;
  image_url: string | null;
  is_active: boolean;
  description: string;
  movements?: Movement[];
}

export interface S3File {
  key: string;
  size: number;
  last_modified: string;
  etag: string;
  original_filename: string;
}

export interface Movement {
  movement_date: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unit_cost?: number | null;
  note?: string | null;
  source?: string | null;
  reference_id?: string | null;
}

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // ApiClient exposes methods to call auth, profile, product and S3 endpoints

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit',
      mode: 'cors',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      
      if (response.status === 401 || response.status === 403) {
        this.logout();
        throw new Error('Not authenticated');
      }
      
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async signup(email: string, password: string, name: string) {
    return this.request<string>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request<{ 
      token: string;
      refresh_token: string;
      expires_in: number;
      user: User 
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.data.token);
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Profile
  async getProfile() {
    return this.request<Profile>('/profiles/me');
  }

  async updateProfile(name: string) {
    return this.request<Profile>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  // Products
  async getProducts() {
    return this.request<Product[]>('/products/');
  }

  async getProduct(id: string, days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.request<Product>(`/products/${id}${query}`);
  }

  async createProduct(product: {
    name: string;
    sku: string;
    category: string;
    supplier: string;
    price: number;
    reorder_level: number;
    in_stock: number;
    description: string;
    is_active: boolean;
    image_url?: string;
    movements?: Movement[];
  }) {
    return this.request<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    id: string,
    product: Partial<{
      name: string;
      category: string;
      supplier: string;
      price: number;
      reorder_level: number;
      in_stock: number;
      description: string;
      is_active: boolean;
    }>
  ) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request<string>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // S3 File Management
  async listFiles() {
    return this.request<S3File[]>('/s3/files');
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/s3/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async downloadFile(fileKey: string) {
    return this.request<{ download_url: string; file_key: string }>(`/s3/download/${encodeURIComponent(fileKey)}`);
  }

  async deleteFile(fileKey: string) {
    return this.request<{ file_key: string; deleted: boolean }>(`/s3/files/${encodeURIComponent(fileKey)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
