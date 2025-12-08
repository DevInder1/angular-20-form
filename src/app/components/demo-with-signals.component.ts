import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

/**
 * ✅ GOOD EXAMPLE: OnPush WITH Signals
 * 
 * Benefits:
 * - filteredUsers() only recomputes when dependencies change
 * - Automatic memoization (caching)
 * - No unnecessary array allocations
 * - Precise dependency tracking
 * - Can easily add debouncing
 */
@Component({
  selector: 'app-demo-with-signals',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h3>✅ OnPush WITH Signals</h3>
      
      <div class="controls">
        <input 
          type="text"
          [value]="searchTerm()"
          (input)="searchTerm.set($any($event.target).value)"
          placeholder="Search users..."
          class="search-input"
        />
        <button (click)="triggerUnrelatedChange()">
          Trigger Unrelated Change
        </button>
      </div>

      <div class="stats">
        <span class="stat">Compute Count: {{ computeCount() }}</span>
        <span class="stat">Total Users: {{ users().length }}</span>
        <span class="stat">Filtered: {{ filteredUsers().length }}</span>
      </div>

      <cdk-virtual-scroll-viewport itemSize="72" class="user-list">
        <div *cdkVirtualFor="let user of filteredUsers(); trackBy: trackByUserId" class="user-card">
          <strong>{{ user.name }}</strong>
          <small>{{ user.email }}</small>
          <span class="badge">{{ user.department }}</span>
        </div>
        @if (filteredUsers().length === 0) {
          <div class="empty-state">No users found</div>
        }
      </cdk-virtual-scroll-viewport>

      <div class="explanation">
        <p><strong>What happens:</strong></p>
        <ul>
          <li>✅ OnPush prevents checks from parent changes</li>
          <li>✅ filteredUsers() only recomputes when searchTerm() or users() change</li>
          <li>✅ Template can read filteredUsers() multiple times - same cached result!</li>
          <li>✅ No new arrays created unless data actually changes</li>
          <li>✅ Compute count only increases when dependencies change</li>
          <li>✅ Virtual scrolling renders only visible items (1000 users, only ~10 rendered!)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      border: 2px solid #10b981;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #ecfdf5;
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
      background: rgba(16, 185, 129, 0.1);
      border-radius: 4px;
    }

    .stat {
      font-size: 14px;
      font-weight: 600;
    }

    .user-list {
      height: 400px;
      width: 100%;
    }

    cdk-virtual-scroll-viewport {
      height: 400px;
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      display: block;
      overflow-y: auto;
      contain: strict;
    }

    cdk-virtual-scroll-viewport ::ng-deep .cdk-virtual-scroll-content-wrapper {
      width: 100%;
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
export class DemoWithSignalsComponent {
  // All state as signals
  protected readonly users = signal<User[]>(this.generateUsers(1000));
  protected readonly searchTerm = signal('');
  protected readonly unrelatedValue = signal(0);
  
  // Track compute count outside of computed
  private computeCounter = 0;
  protected readonly computeCount = signal(0);

  // ✅ Computed - only recalculates when dependencies change
  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();
    
    // Track computation outside signal context
    this.computeCounter++;
    const currentCount = this.computeCounter;
    
    console.log(`✅ With Signals - Compute #${currentCount}: Filtering ${allUsers.length} users for "${term}"`);
    
    // Update count asynchronously after computed returns
    queueMicrotask(() => this.computeCount.set(currentCount));
    
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  triggerUnrelatedChange(): void {
    this.unrelatedValue.update(n => n + 1);
    console.log('✅ With Signals - Unrelated change triggered, but filteredUsers() NOT recomputed!');
  }

  trackByUserId(_index: number, user: User): number {
    return user.id;
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
