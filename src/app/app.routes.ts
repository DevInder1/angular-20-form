import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components/user/user.component').then(m => m.UserComponent)
  },
  {
    path: 'demo',
    loadComponent: () => import('./components/rendering-demo.component').then(m => m.RenderingDemoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
