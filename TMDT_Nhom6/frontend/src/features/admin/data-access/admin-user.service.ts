import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserView {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5020/api/users';

  getUsers(): Observable<UserView[]> {
    return this.http.get<UserView[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  updateUserRole(id: number, role: 'admin' | 'customer'): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/role`, { role }, { headers: this.authHeaders() });
  }

  toggleUserStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/status`, {}, { headers: this.authHeaders() });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
  }
}
