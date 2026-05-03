import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnChanges,
  output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnChanges {
  @ViewChild('dialogEl') dialogEl!: ElementRef<HTMLDivElement>;

  title         = input.required<string>();
  message       = input.required<string>();
  confirmLabel  = input<string>('Confirm');
  cancelLabel   = input<string>('Cancel');
  isOpen        = input.required<boolean>();

  confirmed = output<void>();
  cancelled = output<void>();

  private triggerEl: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen()) {
        this.triggerEl = document.activeElement as HTMLElement;
        // Focus the dialog after render
        setTimeout(() => {
          this.dialogEl?.nativeElement?.focus();
        }, 0);
      } else if (this.triggerEl) {
        this.triggerEl.focus();
        this.triggerEl = null;
      }
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const el = this.dialogEl?.nativeElement;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
