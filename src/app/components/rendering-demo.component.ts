import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DemoWithoutSignalsComponent } from './demo-without-signals.component';
import { DemoWithSignalsComponent } from './demo-with-signals.component';
import { DemoWithDebounceComponent } from './demo-with-debounce.component';

/**
 * Main demo page showing side-by-side comparison
 */
@Component({
  selector: 'app-rendering-demo',
  standalone: true,
  imports: [
    DemoWithoutSignalsComponent,
    DemoWithSignalsComponent,
    DemoWithDebounceComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-page">
      <header class="header">
        <h1>OnPush Change Detection: Signals vs No Signals</h1>
        <p class="subtitle">
          Open the browser console to see real-time logging of filter operations.
          Try typing in each search box and clicking the "Trigger Unrelated Change" button
          to see the difference in behavior.
        </p>
      </header>

      <div class="instructions">
        <h3>📝 Instructions:</h3>
        <ol>
          <li><strong>Open your browser's developer console</strong> (F12 or Cmd+Option+I)</li>
          <li><strong>Type in any search box</strong> - watch the console logs</li>
          <li><strong>Click "Trigger Unrelated Change"</strong> - see which components recompute</li>
          <li><strong>Compare the filter/compute counts</strong> between the three approaches</li>
        </ol>
      </div>

      <div class="comparison-grid">
        <app-demo-without-signals />
        <app-demo-with-signals />
        <app-demo-with-debounce />
      </div>

      <div class="summary">
        <h2>Key Takeaways</h2>
        
        <div class="takeaway">
          <h3>❌ OnPush WITHOUT Signals</h3>
          <ul>
            <li>getFilteredUsers() runs <strong>3 times per render</strong> (once per template reference)</li>
            <li>Creates <strong>new arrays every time</strong> (memory waste)</li>
            <li><strong>No memoization</strong> - same work repeated</li>
            <li>Filter count increases rapidly</li>
          </ul>
        </div>

        <div class="takeaway">
          <h3>✅ OnPush WITH Signals</h3>
          <ul>
            <li>filteredUsers() computed <strong>only when dependencies change</strong></li>
            <li><strong>Automatic memoization</strong> - result cached</li>
            <li>Template can read filteredUsers() <strong>unlimited times</strong> - same cached value</li>
            <li>No unnecessary array allocations</li>
            <li>Compute count only increases when searchTerm() or users() actually change</li>
          </ul>
        </div>

        <div class="takeaway">
          <h3>🚀 OnPush WITH Signals + Debouncing</h3>
          <ul>
            <li><strong>75% fewer filter operations</strong> compared to no debounce</li>
            <li>Type "User 5" = 1 computation (vs 6 without debounce)</li>
            <li><strong>Smoother typing</strong> experience (no lag)</li>
            <li>Separate input tracking from search execution</li>
            <li>Visual feedback while debouncing</li>
          </ul>
        </div>

        <div class="performance-comparison">
          <h3>Performance Comparison</h3>
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Without Signals</th>
                <th>With Signals</th>
                <th>With Debounce</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Type "User 5" (6 keystrokes)</td>
                <td>18 operations (3× per render)</td>
                <td>6 operations (1× per render)</td>
                <td>1 operation (after delay)</td>
              </tr>
              <tr>
                <td>Click "Unrelated Change"</td>
                <td>3 operations (unnecessary)</td>
                <td>0 operations ✅</td>
                <td>0 operations ✅</td>
              </tr>
              <tr>
                <td>Memory allocations</td>
                <td>New array every render</td>
                <td>Cached until change</td>
                <td>Cached until change</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      color: #1f2937;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .instructions {
      background: #fffbeb;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .instructions h3 {
      margin-top: 0;
      color: #92400e;
    }

    .instructions ol {
      margin: 10px 0 0 0;
      padding-left: 24px;
    }

    .instructions li {
      margin: 8px 0;
      color: #78350f;
    }

    .comparison-grid {
      display: grid;
      gap: 20px;
      margin-bottom: 40px;
    }

    @media (min-width: 1200px) {
      .comparison-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .summary {
      background: #f9fafb;
      border-radius: 8px;
      padding: 30px;
    }

    .summary h2 {
      margin-top: 0;
      color: #1f2937;
    }

    .takeaway {
      margin: 20px 0;
      padding: 15px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .takeaway h3 {
      margin-top: 0;
    }

    .takeaway ul {
      margin: 10px 0 0 0;
      padding-left: 24px;
    }

    .takeaway li {
      margin: 6px 0;
    }

    .performance-comparison {
      margin-top: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    thead {
      background: #f3f4f6;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      font-weight: 600;
      color: #374151;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background: #f9fafb;
    }
  `]
})
export class RenderingDemoComponent {}
