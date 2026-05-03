import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title       = input<string>('Nothing here yet');
  message     = input<string>('');
  actionLabel = input<string>('');
  actionRoute = input<string>('');
  icon        = input<string>('📭');
}
