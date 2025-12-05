import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UserComponent } from './components/user/user.component';

@Component({
  selector: 'app-root',
  imports: [UserComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected title = 'Angular 21 - Generic Form Layout';
}
