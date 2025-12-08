import { Component, ChangeDetectionStrategy, signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

/**
 * ❌ BAD EXAMPLE: OnPush WITHOUT Signals
 * 
 * Problems:
 * - getFilteredUsers() runs on EVERY template check
 * - Creates new array every time (memory waste)
 * - No memoization
 * - Still runs when parent fires events
 */
@Component({
  selector: 'app-demo-without-signals',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-container">
      <h3>❌ OnPush WITHOUT Signals</h3>
      
      <div class="controls">
        <input 
          type="text"
          [value]="searchTerm"
          (input)="onSearchChange($event)"
          placeholder="Search users..."
          class="search-input"
        />
        <button (click)="triggerUnrelatedChange()">
          Trigger Unrelated Change
        </button>
      </div>

      <div class="stats">
        <span class="stat">Filter Count: {{ filterCount }}</span>
        <span class="stat">Total Users: {{ users.length }}</span>
        <span class="stat">Filtered: {{ getFilteredUsers().length }}</span>
      </div>

      <div class="user-list">
        @for (user of getFilteredUsers(); track user.id) {
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
          <li>✅ OnPush prevents checks from parent changes</li>
          <li>⚠️ getFilteredUsers() still runs on EVERY template render</li>
          <li>⚠️ Creates new array each time (memory waste)</li>
          <li>⚠️ Filter count increases even when result is same</li>
          <li>❌ Template reads getFilteredUsers() 3 times = 3 filter operations!</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      border: 2px solid #ef4444;
      border-radius: 8px;
      margin-bottom: 20px;
      background: #fee;
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
      background: rgba(239, 68, 68, 0.1);
      border-radius: 4px;
    }

    .stat {
      font-size: 14px;
      font-weight: 600;
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
export class DemoWithoutSignalsComponent {
  users: User[] = this.generateUsers(100);
  searchTerm = '';
  filterCount = 0;
  unrelatedValue = 0;

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    console.log('🟡 Without Signals - Search changed:', this.searchTerm);
  }

  triggerUnrelatedChange(): void {
    this.unrelatedValue++;
    console.log('🟡 Without Signals - Unrelated change triggered');
  }

  // ❌ This runs EVERY time the template is checked
  // Even when called multiple times in template!
  getFilteredUsers(): User[] {
    this.filterCount++; // Track how many times this runs
    console.log(`🟡 Without Signals - Filter #${this.filterCount}: Filtering ${this.users.length} users for "${this.searchTerm}"`);
    
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
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
