import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-search-pagination',
  imports: [CommonModule],
  templateUrl: './search-pagination.component.html',
  styleUrl: './search-pagination.component.css'
})
export class SearchPaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Input() pageSizeOptions = [7, 10, 25, 50, 100];
  get pages() {
    return Array(Math.ceil(this.totalItems / this.pageSize)).fill(0).map((_, i) => i + 1);
  }

  onSearch(event: any) {
    this.search.emit(event.target.value);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  onPageSizeChange(event: any) {
    this.pageSizeChange.emit(+event.target.value);
  }
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }

  getMin(a: number, b: number) {
    return a < b ? a : b;
  }
}
