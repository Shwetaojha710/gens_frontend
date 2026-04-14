import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notyf } from 'notyf';
import { EmployeePortalService } from '../services/employee-portal.service';

@Component({
  selector: 'app-employee-portal-holidays',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-portal-holidays.component.html',
  styleUrl: './employee-portal-holidays.component.css',
})
export class EmployeePortalHolidaysComponent implements OnInit {
  loading = true;
  list: Record<string, unknown>[] = [];
  /** `null` = show all types */
  selectedType: string | null = null;
  private notyf = new Notyf();

  constructor(private api: EmployeePortalService) {}

  ngOnInit(): void {
    this.api.getHolidays().subscribe({
      next: (rows) => {
        this.loading = false;
        this.list = (rows as Record<string, unknown>[]) || [];
        this.selectedType = null;
      },
      error: (e: Error) => {
        this.loading = false;
        this.notyf.error(e.message || 'Could not load holidays');
      },
    });
  }

  get uniqueTypes(): string[] {
    const set = new Set<string>();
    for (const h of this.list) {
      const t = String(h['holiday_type_name'] ?? '').trim() || 'Unspecified';
      set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  get displayList(): Record<string, unknown>[] {
    const sorted = [...this.list].sort((a, b) => {
      const ta = new Date(String(a['date'])).getTime();
      const tb = new Date(String(b['date'])).getTime();
      return (Number.isNaN(ta) ? 0 : ta) - (Number.isNaN(tb) ? 0 : tb);
    });
    if (this.selectedType === null) {
      return sorted;
    }
    return sorted.filter((h) => this.typeLabel(h) === this.selectedType);
  }

  typeLabel(h: Record<string, unknown>): string {
    return String(h['holiday_type_name'] ?? '').trim() || 'Unspecified';
  }

  badgeClass(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('public')) {
      return 'ep-holiday-badge ep-holiday-badge--public';
    }
    if (t.includes('optional')) {
      return 'ep-holiday-badge ep-holiday-badge--optional';
    }
    if (t.includes('regional')) {
      return 'ep-holiday-badge ep-holiday-badge--regional';
    }
    return 'ep-holiday-badge ep-holiday-badge--default';
  }

  selectFilter(type: string | null): void {
    this.selectedType = type;
  }
}
