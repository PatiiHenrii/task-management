import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  template: '<span class="brand-mark" aria-hidden="true">✓</span>',
  styles: [`.brand-mark { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #5148cf; color: white; font-weight: 700; }`]
})
export class BrandMarkComponent {}
