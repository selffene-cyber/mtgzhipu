// MTG Automotora - API Client
// Cliente para conectar con el API Worker de Cloudflare

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mtg-api.gerencia-395.workers.dev';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ==================== VEHÍCULOS ====================

export async function getVehicles(params?: {
  limit?: number;
  offset?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  transmission?: string;
  fuelType?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
  }
  const query = searchParams.toString();
  return fetchApi<any[]>(`/api/vehicles${query ? `?${query}` : ''}`);
}

export async function getVehicleBySlug(slug: string) {
  return fetchApi<any>(`/api/vehicles/${slug}`);
}

export async function createVehicle(data: any) {
  return fetchApi<any>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id: string, data: any) {
  return fetchApi<any>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== LEADS ====================

export async function getLeads() {
  return fetchApi<any[]>('/api/leads');
}

export async function createLead(data: {
  vehicleId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  source?: string;
  notes?: string;
}) {
  return fetchApi<any>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(id: string, data: any) {
  return fetchApi<any>(`/api/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== AUTH ====================

export async function login(email: string, password: string) {
  return fetchApi<{ id: string; email: string; name: string; role: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: { email: string; password: string; name: string }) {
  return fetchApi<any>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==================== STATS ====================

export async function getStats() {
  return fetchApi<{ vehicles: number; leads: number; auctions: number }>('/api/stats');
}

// ==================== UPLOAD ====================

export async function uploadFile(file: File, folder: string = 'vehicles'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  } catch (error) {
    return { success: false, error: 'Error al subir archivo' };
  }
}

// ==================== AUCTIONS ====================

export async function getAuctions() {
  return fetchApi<any[]>('/api/auctions');
}

export async function getAuctionById(id: string) {
  return fetchApi<any>(`/api/auctions/${id}`);
}

export async function placeBid(auctionId: string, amount: number, userId: string) {
  return fetchApi<any>(`/api/auctions/${auctionId}/bid`, {
    method: 'POST',
    body: JSON.stringify({ amount, userId }),
  });
}

// ==================== CONSIGNMENTS ====================

export async function getConsignments() {
  return fetchApi<any[]>('/api/consignments');
}

export async function createConsignment(data: any) {
  return fetchApi<any>('/api/consignments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateConsignment(id: string, data: any) {
  return fetchApi<any>(`/api/consignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== RESERVATIONS ====================

export async function getReservations() {
  return fetchApi<any[]>('/api/reservations');
}

export async function createReservation(data: any) {
  return fetchApi<any>('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export { API_URL };
