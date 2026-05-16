import { Injectable, computed, inject, signal } from '@angular/core';
import { ADMIN_DATA_SOURCE, type AdminDashboardSnapshot } from './admin.data-source';
import { AdminOrderService } from './admin-order.service';
import { AdminUserService, UserView } from './admin-user.service';
import { AdminMarketingService, CouponView, BannerView, BlogPostView } from './admin-marketing.service';
import { AdminSettingsService, SystemSetting } from './admin-settings.service';
import { mapOrderDto } from '@/features/commerce/data-access/commerce.mapper';
import type { OrderDto } from '@/features/commerce/data-access/commerce.api.types';
import type { Order } from '@/core/models';

const createEmptySnapshot = (): AdminDashboardSnapshot => ({
  products: [],
  orders: [],
  users: [],
  feedback: []
});

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly dataSource = inject(ADMIN_DATA_SOURCE);
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly adminUserService = inject(AdminUserService);
  private readonly adminMarketingService = inject(AdminMarketingService);
  private readonly adminSettingsService = inject(AdminSettingsService);
  private readonly snapshotSignal = signal<AdminDashboardSnapshot>(createEmptySnapshot());
  private readonly hasErrorSignal = signal(false);
  private readonly realOrdersSignal = signal<Order[]>([]);
  private readonly realUsersSignal = signal<UserView[]>([]);
  private readonly realCouponsSignal = signal<CouponView[]>([]);
  private readonly realBannersSignal = signal<BannerView[]>([]);
  private readonly realBlogsSignal = signal<BlogPostView[]>([]);
  private readonly systemSettingsSignal = signal<SystemSetting | null>(null);

  readonly products = computed(() => this.snapshotSignal().products);
  readonly orders = computed(() => this.realOrdersSignal().length > 0 ? this.realOrdersSignal() : this.snapshotSignal().orders);
  readonly users = computed(() => this.realUsersSignal().length > 0 ? this.realUsersSignal() : this.snapshotSignal().users);
  readonly coupons = computed(() => this.realCouponsSignal());
  readonly banners = computed(() => this.realBannersSignal());
  readonly blogs = computed(() => this.realBlogsSignal());
  readonly systemSettings = computed(() => this.systemSettingsSignal());
  readonly feedback = computed(() => this.snapshotSignal().feedback);
  readonly hasError = computed(() => this.hasErrorSignal());

  readonly totalRevenue = computed(() => {
    return this.orders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  readonly pendingOrders = computed(() => {
    return this.orders().filter((order: any) => order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'pendingpayment').length;
  });

  constructor() {
    this.loadSnapshot();
    this.loadRealOrders();
    this.loadRealUsers();
    this.loadMarketingData();
    this.loadSettings();
  }

  private loadSnapshot(): void {
    this.dataSource.loadSnapshot().subscribe({
      next: (snapshot) => {
        this.snapshotSignal.set(snapshot);
        this.hasErrorSignal.set(false);
      },
      error: () => {
        this.snapshotSignal.set(createEmptySnapshot());
        this.hasErrorSignal.set(true);
      }
    });
  }

  loadRealOrders(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    this.adminOrderService.getOrders().subscribe({
      next: (orders) => {
        // Use standard mapper to ensure property names (like notes, orderCode) are correct
        this.realOrdersSignal.set((orders as any[]).map(o => mapOrderDto(o as OrderDto)));
      },
      error: (err) => {
        console.error('Failed to load real admin orders', err);
      }
    });
  }

  loadRealUsers(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.adminUserService.getUsers().subscribe({
      next: (users) => {
        this.realUsersSignal.set(users);
      },
      error: (err) => {
        console.error('Failed to load real admin users', err);
      }
    });
  }

  loadMarketingData(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.adminMarketingService.getCoupons().subscribe(res => this.realCouponsSignal.set(res));
    this.adminMarketingService.getBanners().subscribe(res => this.realBannersSignal.set(res));
    this.adminMarketingService.getBlogPosts().subscribe(res => this.realBlogsSignal.set(res));
  }

  loadSettings(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.adminSettingsService.getSettings().subscribe({
      next: (settings) => this.systemSettingsSignal.set(settings),
      error: (err) => console.error('Failed to load system settings', err)
    });
  }

  updateSettings(settings: SystemSetting): void {
    this.adminSettingsService.updateSettings(settings).subscribe({
      next: (updated) => this.systemSettingsSignal.set(updated),
      error: (err) => console.error('Failed to update system settings', err)
    });
  }
}
