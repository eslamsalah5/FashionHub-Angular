import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalCount  = input.required<number>();
  pageSize    = input<number>(12);

  pageChange = output<number>();

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  });

  goTo(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.pageChange.emit(page);
  }
}
