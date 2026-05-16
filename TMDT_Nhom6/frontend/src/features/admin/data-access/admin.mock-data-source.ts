import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_CATEGORY_PRODUCTS, MOCK_ORDERS, MOCK_USERS } from '@/core/mock-data/ecommerce.mock';
import type { AdminDashboardSnapshot, AdminDataSource } from './admin.data-source';

const MOCK_ADMIN_FEEDBACK = [
  { id: 1, name: 'Linh Tran', content: 'Can them mau moi cho danh muc den.' },
  { id: 2, name: 'Khanh', content: 'Checkout muot va de su dung.' }
];

@Injectable({ providedIn: 'root' })
export class AdminMockDataSource implements AdminDataSource {
  loadSnapshot(): Observable<AdminDashboardSnapshot> {
    return of({
      products: MOCK_CATEGORY_PRODUCTS.map((product) => ({ ...product })),
      orders: MOCK_ORDERS.map((order) => ({
        ...order,
        items: order.items.map((item) => ({ ...item }))
      })),
      users: MOCK_USERS.map((user) => ({
        ...user,
        addresses: user.addresses.map((address) => ({ ...address }))
      })),
      feedback: MOCK_ADMIN_FEEDBACK.map((item) => ({ ...item }))
    });
  }
}
