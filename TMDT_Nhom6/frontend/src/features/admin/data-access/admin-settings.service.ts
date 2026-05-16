import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemSetting {
  id: number;
  storeName: string;
  vatPercentage: number;
  defaultShippingFee: number;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/settings';

  getSettings(): Observable<SystemSetting> {
    return this.http.get<SystemSetting>(this.baseUrl, { headers: this.authHeaders() });
  }

  updateSettings(settings: SystemSetting): Observable<SystemSetting> {
    return this.http.put<SystemSetting>(this.baseUrl, settings, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
  }
}
