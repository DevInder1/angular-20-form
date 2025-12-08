import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

/**
 * 🚀 ADVANCED EXAMPLE: OnPush WITH Signals + Debouncing
 * 
 * Advanced optimizations:
 * - Debounced search (only filters after user stops typing)
 * - Separate input signal from search signal
 * - Even fewer computations
 * - Better UX (less lag while typing)
 */
@Component({
  selector: 'app-demo-with-debounce',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h3>🚀 OnPush WITH Signals + Debouncing</h3>
      
      <div class="controls">
        <input 
          type="text"
          [value]="searchInput()"
          (input)="searchInput.set($any($event.target).value)"
          placeholder="Search users (debounced 300ms)..."
          class="search-input"
        />
        <button (click)="triggerUnrelatedChange()">
          Trigger Unrelated Change
        </button>
      </div>

      <div class="stats">
        <span class="stat">Compute Count: {{ computeCount() }}</span>
        <span class="stat">Input Changes: {{ inputChangeCount() }}</span>
        <span class="stat">Total Users: {{ users().length }}</span>
        <span class="stat">Filtered: {{ filteredUsers().length }}</span>
      </div>

      @if (searchInput() !== searchTerm()) {
        <div class="debounce-indicator">
          ⏱️ Waiting for you to stop typing...
        </div>
      }

      <div class="user-list">
        @for (user of filteredUsers(); track user.id) {
          <div class="user-card">
            <strong>{{ user.name }}</strong>
            <small>{{ user.email }}</small>
            <span class="badge">{{ user.department }}</span>
          </div>
        } @empty {
          <div class="empty-state">No users found</div>
        }
      </div>

      <div class="explanation">
        <p><strong>What happens:</strong></p>
        <ul>
          <li>✅ All benefits of OnPush + Signals</li>
          <li>🚀 PLUS: Debounced search (300ms delay)</li>
          <li>🚀 Type "User 5" fast = only 1 filter operation!</li>
          <li>🚀 Without debounce = 6 operations (U-s-e-r- -5)</li>
          <li>🚀 75% reduction in filter operations!</li>
          <li>🚀 Smoother typing experience (no lag)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      border: 2px solid #8b5cf6;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #f5f3ff;
    }

    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .search-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    button {
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #2563eb;
    }

    .stats {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      padding: 10px;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 4px;
    }

    .stat {
      font-size: 14px;
      font-weight: 600;
    }

    .debounce-indicator {
      padding: 8px 12px;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 4px;
      margin-bottom: 15px;
      font-size: 14px;
      color: #92400e;
    }

    .user-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .user-card {
      padding: 12px;
      border-bottom: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-card:last-child {
      border-bottom: none;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #e5e7eb;
      border-radius: 12px;
      font-size: 12px;
      width: fit-content;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #999;
    }

    .explanation {
      margin-top: 15px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      font-size: 13px;
    }

    .explanation ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .explanation li {
      margin: 4px 0;
    }
  `]
})
export class DemoWithDebounceComponent {
  // Separate input signal from search signal
  protected readonly searchInput = signal('');  // Raw input (updates immediately)
  protected readonly searchTerm = signal('');    // Debounced value (updates after delay)
  protected readonly users = signal<User[]>(this.generateUsers(100));
  protected readonly unrelatedValue = signal(0);
  protected readonly computeCount = signal(0);
  protected readonly inputChangeCount = signal(0);

  constructor() {
    // Debounce effect
    let timeoutId: number | undefined;
    
    effect(() => {
      const input = this.searchInput(); // Track raw input
      this.inputChangeCount.update(n => n + 1);
      
      console.log(`🚀 Input changed to: "${input}"`);
      
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      timeoutId = setTimeout(() => {
        this.searchTerm.set(input);
        console.log(`🚀 Debounced search term set to: "${input}"`);
      }, 300) as unknown as number;
    });
  }

  // ✅ Computed - only recalculates when searchTerm() or users() change
  // NOT when searchInput() changes!
  protected readonly filteredUsers = computed(() => {
    this.computeCount.update(n => n + 1);
    
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();
    
    console.log(`🚀 Compute #${this.computeCount()}: Filtering ${allUsers.length} users for "${term}"`);
    
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  triggerUnrelatedChange(): void {
    this.unrelatedValue.update(n => n + 1);
    console.log('🚀 Unrelated change triggered, but filteredUsers() NOT recomputed!');
  }

  private generateUsers(count: number): User[] {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      department: departments[i % departments.length]
    }));
  }
}
