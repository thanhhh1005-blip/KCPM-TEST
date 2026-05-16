import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthFacade } from '@/features/auth/data-access/auth.facade';
import { AdminFacade } from '@/features/admin/data-access/admin.facade';
import { DashboardService, DashboardStats } from '@/features/admin/data-access/dashboard.service';
import { AdminOrderService } from '@/features/admin/data-access/admin-order.service';
import { AdminProductService, ProductView, ProductUpsertInput, CategoryView } from '@/features/admin/data-access/admin-product.service';
import { AdminUserService } from '@/features/admin/data-access/admin-user.service';
import { AdminMarketingService } from '@/features/admin/data-access/admin-marketing.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, map } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  readonly adminFacade = inject(AdminFacade);
  private readonly dashboardService = inject(DashboardService);
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly adminProductService = inject(AdminProductService);
  private readonly adminUserService = inject(AdminUserService);
  private readonly adminMarketingService = inject(AdminMarketingService);
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  activeTab = 'dashboard';
  readonly isSidebarOpen = signal(false);

  selectTab(tab: string): void {
    this.activeTab = tab;
    this.isSidebarOpen.set(false);
    if (tab === 'settings') {
      this.syncSettingsForm();
    }
  }

  syncSettingsForm(): void {
    const current = this.adminFacade.systemSettings();
    if (current) {
      this.settingsForm = {
        storeName: current.storeName,
        vatPercentage: current.vatPercentage,
        defaultShippingFee: current.defaultShippingFee,
        contactEmail: current.contactEmail || '',
        contactPhone: current.contactPhone || '',
        address: current.address || ''
      };
    }
  }

  saveSettings(): void {
    const current = this.adminFacade.systemSettings();
    if (!current) {
      this.showToast('Không có dữ liệu thiết lập để lưu.', 'error');
      return;
    }

    const updated = {
      ...current,
      ...this.settingsForm
    };

    this.adminFacade.updateSettings(updated);
    this.showToast('Đã lưu cấu hình hệ thống thành công!', 'success');
  }
  
  getTitle(): string {
    switch (this.activeTab) {
      case 'dashboard': return 'Tổng quan Hệ thống';
      case 'products': return 'Quản lý Sản phẩm';
      case 'orders': return 'Quản lý Đơn hàng';
      case 'customers': return 'Quản lý Khách hàng';
      case 'marketing': return 'Chiến dịch Marketing';
      case 'settings': return 'Cài đặt Phân quyền';
      default: return 'Admin Home';
    }
  }

  readonly stats = signal<DashboardStats | null>(null);
  readonly statsLoading = signal(false);

  // Products State
  readonly products = signal<any[]>([]);
  readonly productsLoading = signal(false);
  readonly categories = signal<CategoryView[]>([]);
  readonly showProductModal = signal(false);
  readonly isEditing = signal(false);
  readonly currentProduct = signal<ProductView | null>(null);
  
  // Marketing State
  readonly showCouponModal = signal(false);
  readonly showBlogModal = signal(false);
  couponForm = { code: '', discountPercentage: 10, expiryDate: '', maxUsage: 100 };
  blogForm = { title: '', slug: '', content: '', author: 'Admin', imageUrl: '' };

  // Settings State
  settingsForm = {
    storeName: '',
    vatPercentage: 10,
    defaultShippingFee: 30000,
    contactEmail: '',
    contactPhone: '',
    address: ''
  };
  
  // Suggestion Control
  readonly activeSuggestionField = signal<string | null>(null);

  showSuggestions(field: string) { this.activeSuggestionField.set(field); }
  hideSuggestions() { setTimeout(() => this.activeSuggestionField.set(null), 200); }
  selectSuggestion(field: string, value: string) {
    (this.productForm as any)[field] = value;
    this.activeSuggestionField.set(null);
  }

  getFilteredSuggestions(field: string): string[] {
    const query = (this.productForm as any)[field]?.toString().toLowerCase() || '';
    let pool: string[] = [];
    if (field === 'brand') pool = this.brandSuggestions();
    if (field === 'material') pool = this.materialSuggestions();
    if (field === 'style') pool = this.styleSuggestions();
    if (field === 'stockLeft') pool = ['10', '20', '50', '100', '250', '500'];
    
    // For SKU/Slug, we show "Smart" suggestions based on current name
    if (field === 'sku' && this.productForm.name) {
      const prefix = (this.productForm.brand || 'BEE').substring(0, 3).toUpperCase();
      const namePart = this.productForm.name.split(' ').map(w => w[0]).join('').toUpperCase();
      pool = [`${prefix}-${namePart}-${Math.floor(100 + Math.random() * 900)}`];
    }
    if (field === 'slug' && this.productForm.name) {
      pool = [this.slugify(this.productForm.name)];
    }

    if (!query) return pool;
    return pool.filter(s => s.toLowerCase().includes(query));
  }

  // Auto-fill logic
  onNameChange() {
    if (!this.isEditing()) {
      this.productForm.slug = this.slugify(this.productForm.name);
      
      const prefix = (this.productForm.brand || 'BEE').substring(0, 3).toUpperCase();
      const words = this.productForm.name.trim().split(' ').filter(w => w);
      const namePart = words.length > 0 ? words.map(w => w[0]).join('').toUpperCase() : '';
      
      let suffix = '';
      if (this.productForm.sku) {
        const parts = this.productForm.sku.split('-');
        suffix = parts.length > 0 ? parts[parts.length - 1] : '';
      }
      if (!suffix || isNaN(Number(suffix))) {
        suffix = Math.floor(100 + Math.random() * 900).toString();
      }
      
      if (namePart) {
        this.productForm.sku = `${prefix}-${namePart}-${suffix}`;
      } else {
        this.productForm.sku = '';
      }
    }
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  // Suggestions for attributes
  readonly brandSuggestions = signal<string[]>(['BeeShop', 'IKEA', 'JYSK', 'Hồng Kông Decor', 'Gốm Sứ Minh Long', 'NORDIC', 'Hàn Quốc Home']);
  readonly materialSuggestions = signal<string[]>(['Gỗ sồi', 'Gỗ công nghiệp', 'Gốm sứ', 'Kim loại Sơn tĩnh điện', 'Thủy tinh cao cấp', 'Vải nỉ', 'Nhựa ABS', 'Đá cẩm thạch']);
  readonly styleSuggestions = signal<string[]>(['Hiện đại (Modern)', 'Tối giản (Minimalism)', 'Cổ điển (Classic)', 'Bắc Âu (Nordic)', 'Sang trọng (Luxurious)', 'Vintage', 'Indochine']);
  productForm: ProductUpsertInput = this.getEmptyProduct();
  isUploading = false;

  // Search/Suggestions
  readonly searchQuery = signal('');
  readonly suggestions = signal<string[]>([]);
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.adminFacade.loadRealOrders();
    this.loadDashboardStats();
    this.loadProducts();
    this.loadCategories();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.loadProducts(query);
    });
  }

  loadDashboardStats(): void {
    this.statsLoading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
      }
    });
  }

  loadProducts(query?: string): void {
    const q = query ?? this.searchQuery();
    this.productsLoading.set(true);
    // Passing pageSize 100 to see more products at once
    this.adminProductService.getProducts(100).subscribe({
      next: (res: any) => {
        // Handle standard ProductListResult (Items) or alternate structures
        let list = res.items || res.products || (Array.isArray(res) ? res : []);
        if (q) {
          list = list.filter((p: any) => 
            p.productName.toLowerCase().includes(q.toLowerCase()) || 
            p.sku.toLowerCase().includes(q.toLowerCase())
          );
        }
        this.products.set(list);
        this.productsLoading.set(false);
      },
      error: () => this.productsLoading.set(false)
    });
  }

  loadCategories(): void {
    this.adminProductService.getCategories().subscribe(res => this.categories.set(res));
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.searchSubject.next(q);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  getChartMaxRevenue(): number {
    const chart = this.dailyRevenueChart();
    if (chart.length === 0) return 1;
    return Math.max(...chart.map(c => c.revenue), 1);
  }

  dailyRevenueChart = computed(() => {
    const orders = this.adminFacade.orders();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const displayDate = `${day}/${month}`;
      const compareDate = d.toISOString().split('T')[0];
      
      const revenue = orders
        .filter(o => o.createdAt?.startsWith(compareDate) && o.paymentStatus?.toLowerCase() === 'paid' && o.status?.toLowerCase() !== 'refunded')
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        
      last7Days.push({ date: displayDate, revenue });
    }
    return last7Days;
  });

  getAbsoluteImageUrl(path: string | undefined): string {
    if (!path) return '/assets/images/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `http://localhost:5020${path}`;
  }

  getBarHeight(revenue: number): number {
    const max = this.getChartMaxRevenue();
    return Math.max((revenue / max) * 100, 2);
  }

  formatChartDate(dateStr: string): string {
    return dateStr;
  }

  get paidOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.paymentStatus?.toLowerCase() === 'paid').length;
  }

  get totalPaidRevenue(): number {
    return this.adminFacade.orders()
      .filter((o: any) => o.paymentStatus?.toLowerCase() === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  get processingOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'processing').length;
  }

  get shippingOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'shipping' || o.status?.toLowerCase() === 'shipped').length;
  }

  get completedOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'completed').length;
  }

  get cancelledOrdersCount(): number {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'cancelled').length;
  }

  get refundRequestedOrders(): any[] {
    return this.adminFacade.orders().filter((o: any) => o.status?.toLowerCase() === 'refund_requested');
  }

  get refundRequestsCount(): number {
    return this.refundRequestedOrders.length;
  }

  // Product Actions
  openAddProductModal(): void {
    this.isEditing.set(false);
    this.productForm = this.getEmptyProduct();
    // Re-set category to first loaded category if available
    if (this.categories().length > 0) {
      const firstCat = this.categories()[0];
      this.productForm.categoryId = firstCat.id;
      this.productForm.category = firstCat.name;
    }
    this.showProductModal.set(true);
  }

  editProduct(product: ProductView): void {
    this.isEditing.set(true);
    this.currentProduct.set(product);
    this.productForm = {
      sku: product.sku,
      name: product.productName,
      slug: product.slug,
      price: product.price,
      originalPrice: product.oldPrice,
      categoryId: product.categoryId,
      category: product.category,
      image: product.image,
      hoverImage: product.hoverImage,
      videoUrl: product.videoUrl,
      tag: product.tag,
      soldPercentage: product.soldPercentage,
      stockLeft: product.stockLeft,
      rating: product.rating,
      reviews: product.reviews,
      brand: product.brand,
      color: product.color,
      material: product.material,
      style: product.style,
      inStock: product.inStock,
      isActive: product.isActive
    };
    this.showProductModal.set(true);
  }

  saveProduct(): void {
    // Client-side validation
    if (!this.productForm.name || this.productForm.name.length < 2) {
      this.showToast('Tên sản phẩm phải có ít nhất 2 ký tự!', 'error'); return;
    }
    if (!this.productForm.sku || this.productForm.sku.length < 2) {
      this.showToast('Mã SKU phải có ít nhất 2 ký tự!', 'error'); return;
    }
    if (!this.productForm.slug || this.productForm.slug.length < 2) {
      this.showToast('Slug phải có ít nhất 2 ký tự!', 'error'); return;
    }
    if (!this.productForm.image || this.productForm.image.length < 3) {
      this.showToast('Vui lòng tải ảnh chính lên trước khi lưu!', 'error'); return;
    }
    if (!this.productForm.hoverImage || this.productForm.hoverImage.length < 3) {
      this.showToast('Vui lòng tải ảnh hover lên trước khi lưu!', 'error'); return;
    }

    if (this.isEditing() && this.currentProduct()) {
      this.adminProductService.updateProduct(this.currentProduct()!.productId, this.productForm).subscribe({
        next: () => {
          this.showToast('Đã cập nhật sản phẩm thành công!', 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          const msg = err.error?.errors ? JSON.stringify(err.error.errors) : (err.error?.detail || err.error?.title || 'Lỗi khi cập nhật sản phẩm');
          this.showToast(msg, 'error');
        }
      });
    } else {
      this.adminProductService.createProduct(this.productForm).subscribe({
        next: () => {
          this.showToast('Đã thêm sản phẩm mới thành công!', 'success');
          this.closeProductModal();
          this.loadProducts();
        },
        error: (err) => {
          const msg = err.error?.errors ? JSON.stringify(err.error.errors) : (err.error?.detail || err.error?.title || 'Lỗi khi thêm sản phẩm');
          this.showToast(msg, 'error');
        }
      });
    }
  }

  deleteProduct(id: number, e: Event): void {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    this.adminProductService.deleteProduct(id).subscribe({
      next: () => {
        this.showToast('Đã xóa sản phẩm thành công!', 'success');
        this.loadProducts();
      },
      error: () => this.showToast('Lỗi khi xóa sản phẩm', 'error')
    });
  }

  closeProductModal(): void {
    this.showProductModal.set(false);
    this.currentProduct.set(null);
  }

  onImageUpload(event: any, field: 'image' | 'hoverImage'): void {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.adminProductService.uploadImage(file).subscribe({
      next: (res) => {
        this.productForm[field] = res.url;
        this.isUploading = false;
        this.showToast('Tải ảnh thành công!', 'success');
      },
      error: () => {
        this.isUploading = false;
        this.showToast('Lỗi khi tải ảnh', 'error');
      }
    });
  }

  onCategoryChange(e: any): void {
    const id = parseInt(e.target.value);
    const cat = this.categories().find(c => c.id === id);
    if (cat) {
      this.productForm.categoryId = cat.id;
      this.productForm.category = cat.name;
    }
  }

  private getEmptyProduct(): ProductUpsertInput {
    // Set category from first available category
    const firstCat = this.categories()[0];
    return {
      sku: '',
      name: '',
      slug: '',
      price: 0,
      originalPrice: 0,
      categoryId: firstCat?.id ?? 1,
      category: firstCat?.name ?? 'Chưa phân loại',
      image: '',
      hoverImage: '',
      videoUrl: '',
      tag: 'New',
      soldPercentage: 0,
      stockLeft: 100,
      rating: 5,
      reviews: 0,
      brand: 'BeeShop',
      color: 'Mặc định',
      material: 'Gỗ',
      style: 'Hiện đại (Modern)',
      inStock: true,
      isActive: true
    };
  }

  // Professional Toast State
  readonly toast = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  private toastTimeout: any;

  // Professional Confirmation Modal State
  readonly showConfirmModal = signal(false);
  readonly confirmModalData = signal<{ orderId: number, orderNumber: string, approve: boolean } | null>(null);
  isActionRunning = false;

  processRefundRequest(orderId: number, approve: boolean): void {
    const order = this.refundRequestedOrders.find(o => o.id === orderId);
    if (!order) return;

    this.confirmModalData.set({
      orderId,
      orderNumber: order.orderNumber || order.orderCode,
      approve
    });
    this.showConfirmModal.set(true);
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.confirmModalData.set(null);
  }

  confirmProcessRefund(): void {
    const data = this.confirmModalData();
    if (!data) return;

    this.isActionRunning = true;
    const action = data.approve ? 'chấp thuận hoàn tiền' : 'từ chối khiếu nại';

    this.adminOrderService.processRefund(data.orderId, data.approve).subscribe({
      next: (updatedOrder) => {
        this.isActionRunning = false;
        this.closeConfirmModal();
        this.adminFacade.loadRealOrders();
        this.loadDashboardStats();
        this.showToast(`Đã ${action} thành công!`, 'success');
      },
      error: (err) => {
        this.isActionRunning = false;
        console.error(err);
        this.showToast(err.error?.detail || 'Có lỗi xảy ra khi xử lý khiếu nại', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({ message, type });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.hideToast(), 5000);
  }

  hideToast(): void {
    this.toast.set(null);
  }

  // User Management Actions
  toggleUserStatus(userId: number): void {
    this.adminUserService.toggleUserStatus(userId).subscribe({
      next: () => {
        this.showToast('Cập nhật trạng thái người dùng thành công!', 'success');
        this.adminFacade.loadRealUsers();
        this.adminFacade.loadRealOrders(); // Refresh stats if needed
      },
      error: (err) => {
        this.showToast(err.error?.detail || 'Lỗi khi cập nhật trạng thái người dùng', 'error');
      }
    });
  }

  deleteUser(userId: number): void {
    console.log('AdminDashboard: Deleting user ID:', userId);
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) return;

    this.adminUserService.deleteUser(userId).subscribe({
      next: () => {
        this.showToast('Đã xóa người dùng thành công!', 'success');
        this.adminFacade.loadRealUsers();
      },
      error: (err) => {
        console.error('AdminDashboard: Delete user failed', err);
        const errorDetail = err.error?.detail || err.error?.title || 'Lỗi không xác định';
        this.showToast(`Lỗi khi xóa người dùng: ${errorDetail}`, 'error');
      }
    });
  }

  // Marketing Actions
  openAddCouponModal(): void {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    this.couponForm = { code: '', discountPercentage: 10, expiryDate: today.toISOString().split('T')[0], maxUsage: 100 };
    this.showCouponModal.set(true);
  }

  saveCoupon(): void {
    this.adminMarketingService.createCoupon(this.couponForm).subscribe({
      next: () => {
        this.showToast('Đã tạo mã giảm giá thành công!', 'success');
        this.showCouponModal.set(false);
        this.adminFacade.loadMarketingData();
      },
      error: (err) => this.showToast(err.error?.detail || 'Lỗi khi tạo mã giảm giá', 'error')
    });
  }

  deleteCoupon(id: number): void {
    console.log('AdminDashboard: Deleting coupon ID:', id);
    if (!confirm('Xóa mã giảm giá này?')) return;
    this.adminMarketingService.deleteCoupon(id).subscribe({
      next: () => {
        this.showToast('Đã xóa mã giảm giá!', 'success');
        this.adminFacade.loadMarketingData();
      },
      error: (err) => {
        console.error('AdminDashboard: Delete coupon failed', err);
        const errorDetail = err.error?.detail || err.error?.title || 'Lỗi không xác định';
        this.showToast(`Lỗi khi xóa mã giảm giá: ${errorDetail}`, 'error');
      }
    });
  }

  openAddBlogModal(): void {
    this.blogForm = { title: '', slug: '', content: '', author: 'Admin', imageUrl: '' };
    this.showBlogModal.set(true);
  }

  onBlogTitleChange(): void {
    this.blogForm.slug = this.slugify(this.blogForm.title);
  }

  saveBlog(): void {
    if (!this.blogForm.imageUrl) {
      this.showToast('Vui lòng tải ảnh bìa cho bài viết!', 'error'); return;
    }
    this.adminMarketingService.createBlogPost(this.blogForm).subscribe({
      next: () => {
        this.showToast('Đã đăng bài viết thành công!', 'success');
        this.showBlogModal.set(false);
        this.adminFacade.loadMarketingData();
      },
      error: (err) => this.showToast(err.error?.detail || 'Lỗi khi đăng bài viết', 'error')
    });
  }

  deleteBlog(id: number): void {
    console.log('AdminDashboard: Deleting blog ID:', id);
    if (!confirm('Xóa bài viết này?')) return;
    this.adminMarketingService.deleteBlogPost(id).subscribe({
      next: () => {
        this.showToast('Đã xóa bài viết!', 'success');
        this.adminFacade.loadMarketingData();
      },
      error: (err) => {
        console.error('AdminDashboard: Delete blog failed', err);
        const errorDetail = err.error?.detail || err.error?.title || 'Lỗi không xác định';
        this.showToast(`Lỗi khi xóa bài viết: ${errorDetail}`, 'error');
      }
    });
  }

  onMarketingImageUpload(event: any, type: 'blog' | 'banner'): void {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.adminProductService.uploadImage(file).subscribe({
      next: (res) => {
        if (type === 'blog') this.blogForm.imageUrl = res.url;
        this.isUploading = false;
        this.showToast('Tải ảnh thành công!', 'success');
      },
      error: () => {
        this.isUploading = false;
        this.showToast('Lỗi khi tải ảnh', 'error');
      }
    });
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/']);
  }
}
