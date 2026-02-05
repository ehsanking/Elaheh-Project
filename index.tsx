
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // provideZonelessChangeDetection() was replaced by the ngZone: 'noop' option below
  ],
  ngZone: 'noop'
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.