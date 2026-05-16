import { Injectable, computed, signal, inject } from '@angular/core';
import { Product, ProductViewDto, mapProductViewDtoToProduct } from '@/core/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiEndpoints } from '@/core/api/api-endpoints';
import { apiConfig } from '@/core/api/api.config';
import { tap } from 'rxjs';

export interface ProductReview {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductDetailFacade {
  private readonly http = inject(HttpClient);

  readonly selectedProduct = signal<Product | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal<string | null>(null);
  private readonly reviewsSignal = signal<ProductReview[]>([]);
  readonly reviewSubmitStatus = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly reviewErrorMessage = signal<string | null>(null);

  readonly productImages = computed(() => {
    const product = this.selectedProduct();
    if (!product) return [];
    return [product.image, product.hoverImage, product.image, product.hoverImage];
  });

  readonly reviews = computed(() => this.reviewsSignal());

  selectProductById(id: number): void {
    this.selectedProduct.set(null);
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    // Load product detail
    this.http.get<ProductViewDto>(apiEndpoints.products.detail(id))
      .subscribe({
        next: (dto) => {
          this.selectedProduct.set(mapProductViewDtoToProduct(dto));
          this.isLoading.set(false);
          this.loadReviews(id); // Load reviews after product is loaded
        },
        error: (err) => {
          console.error('Failed to load product', err);
          this.selectedProduct.set(null);
          this.isLoading.set(false);
          this.hasError.set(true);
          this.errorMessage.set('Không tải được thông tin sản phẩm.');
        }
      });
  }

  loadReviews(productId: number): void {
    this.http.get<ProductReview[]>(apiEndpoints.products.reviews(productId))
      .subscribe({
        next: (reviews) => {
          // Sort by newest first
          const sorted = [...reviews].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.reviewsSignal.set(sorted);
        },
        error: (err) => console.error('Failed to load reviews', err)
      });
  }

  addComment(author: string, rating: number, comment: string): void {
    const p = this.selectedProduct();
    if (!p) return;

    const payload = {
      productId: p.id,
      author,
      rating,
      comment
    };

    const token = localStorage.getItem('token')?.trim() ?? '';
    let options = {};
    if (token) {
      options = {
        headers: new HttpHeaders({
          [apiConfig.authorizationHeader]: `${apiConfig.bearerPrefix}${token}`,
          [apiConfig.authTokenHeader]: token
        })
      };
    }

    this.reviewSubmitStatus.set('submitting');
    this.reviewErrorMessage.set(null);

    this.http.post<ProductReview>(apiEndpoints.products.reviews(p.id), payload, options)
      .subscribe({
        next: () => {
          this.reviewSubmitStatus.set('success');
          // Refresh reviews and product details to update rating/counts
          this.loadReviews(p.id);
          this.refreshProduct(p.id);
          
          // Reset status after a few seconds
          setTimeout(() => {
            if (this.reviewSubmitStatus() === 'success') {
              this.reviewSubmitStatus.set('idle');
            }
          }, 3000);
        },
        error: (err) => {
          console.error('Failed to add review', err);
          this.reviewSubmitStatus.set('error');
          if (err.status === 401) {
            this.reviewErrorMessage.set('Vui lòng đăng nhập để gửi đánh giá.');
          } else {
            this.reviewErrorMessage.set('Không thể gửi đánh giá lúc này, vui lòng thử lại sau.');
          }
        }
      });
  }

  private refreshProduct(id: number): void {
    this.http.get<ProductViewDto>(apiEndpoints.products.detail(id))
      .subscribe(dto => this.selectedProduct.set(mapProductViewDtoToProduct(dto)));
  }
}

