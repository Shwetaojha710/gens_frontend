import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-header',
  imports: [],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.css'
})
export class LandingHeaderComponent {
  constructor(private router: Router){};
  login() {
    this.router.navigate(['login'])
  }
}
