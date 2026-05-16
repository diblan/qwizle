import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth/auth.interceptor';
import { loadRuntimeConfig, RUNTIME_CONFIG } from './app/config/runtime-config';

loadRuntimeConfig().then((runtimeConfig) => bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
  ],
})).catch((err) => console.error(err));
