import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LandingHeaderComponent } from '../landing-header/landing-header.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';


@Component({
  selector: 'app-landing-page',
  imports: [
    LandingHeaderComponent,
    LandingFooterComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {
    constructor(private router: Router,
  ) {

  }
navigateToCheckOut() {
    this.router.navigate(['check-out']);
  }
}
