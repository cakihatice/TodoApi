import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss'
})
export class Logo {
  @Input() width = 200;
  @Input() variant: 'gradient' | 'white' = 'gradient';
  @Input() animate = false;

  gradId = `dotyGrad-${Math.random().toString(36).slice(2, 9)}`;
  get mainFill(): string {
    return this.variant === 'white' ? '#ffffff' : `url(#${this.gradId})`;
  }
}