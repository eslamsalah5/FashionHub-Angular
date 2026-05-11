import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AdminProductService } from '../../services/admin-product.service';
import { Product } from '../../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../../core/models/pagination.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

/** Which delete action was chosen by the admin */
type DeleteMode = 'soft' | 'hard' | null;

@Component({
  selector: 'app-admin-product-list',
  imports: [RouterLink, CurrencyPipe, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductListComponent {
  private readonly adminService = inject(AdminProductService);

  readonly loading      = signal(true);
  readonly result       = signal<PaginatedResult<Product>>(emptyPage(10));
  readonly deleteTarget = signal<Product | null>(null);
  readonly deleteMode   = signal<DeleteMode>(null);
  readonly pageSize     = 10;

  constructor() {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading.set(true);
    this.adminService.getProducts(pageIndex, this.pageSize).subscribe({
      next: r  => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // ── Delete flow ───────────────────────────────────────────────────────

  /** First step: admin clicks Delete → show mode-selection dialog */
  confirmDelete(product: Product): void {
    this.deleteTarget.set(product);
    this.deleteMode.set(null); // wait for mode selection
  }

  /** Admin picks Soft Delete */
  chooseSoftDelete(): void { this.deleteMode.set('soft'); }

  /** Admin picks Hard Delete */
  chooseHardDelete(): void { this.deleteMode.set('hard'); }

  /** Second step: admin confirms inside the ConfirmDialog */
  doDelete(): void {
    const p    = this.deleteTarget();
    const mode = this.deleteMode();
    if (!p || !mode) return;

    const req$ = mode === 'hard'
      ? this.adminService.hardDeleteProduct(p.id)
      : this.adminService.softDeleteProduct(p.id);

    req$.subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.deleteMode.set(null);
        this.loadPage(this.result().pageIndex);
      },
    });
  }

  cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteMode.set(null);
  }

  // ── Toggle helpers ────────────────────────────────────────────────────

  toggleStatus(product: Product): void {
    this.adminService.toggleStatus(product.id, !product.isActive).subscribe({
      next: () => this.loadPage(this.result().pageIndex),
    });
  }

  toggleFeatured(product: Product): void {
    this.adminService.toggleFeatured(product.id, !product.isFeatured).subscribe({
      next: () => this.loadPage(this.result().pageIndex),
    });
  }

  // ── Computed helpers for template ─────────────────────────────────────

  get deleteDialogOpen(): boolean {
    return this.deleteTarget() !== null && this.deleteMode() !== null;
  }

  get deleteDialogTitle(): string {
    return this.deleteMode() === 'hard' ? 'Hard Delete Product ⚠️' : 'Soft Delete Product';
  }

  get deleteDialogMessage(): string {
    const name = this.deleteTarget()?.name ?? '';
    return this.deleteMode() === 'hard'
      ? `Permanently delete "${name}" and all its images from disk? This CANNOT be undone.`
      : `Mark "${name}" as deleted? Its images will be preserved and it can be restored later.`;
  }

  get deleteDialogConfirmLabel(): string {
    return this.deleteMode() === 'hard' ? 'Delete Permanently' : 'Soft Delete';
  }
}
