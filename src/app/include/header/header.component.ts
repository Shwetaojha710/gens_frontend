import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
    notyf: Notyf | undefined;
  constructor(    private auth: AuthService,  private router: Router){

  }
toggleshow() {
  const dropdownMenu = document.querySelector(".dropdown-menu.dropdown-menu-end.mt-3.py-2");
  if (dropdownMenu) {
    dropdownMenu.classList.toggle("show");
  }
}
 personalDetail:any={}
ngOnInit() {
this.personalDetail = JSON.parse(localStorage.getItem('user') || '{}');
}

logout(){
  console.log("hello logout api called")

        this.auth.logout().subscribe({
      next: (res) => {
        const data = res
        console.log(data,"ss")
        if (data.status === true) {
          localStorage.clear()
          if (this.notyf) {
            this.notyf.success(data.message);
          }
          this.router.navigate(['login']);
        }
        else if(data.status=='expired'){
          this.notyf?.error(data.message);
          this.router.navigate(['login']);
        }
        else {
          if (this.notyf) {
            this.notyf.error(data.message);
          }
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        if (this.notyf) {
          this.notyf.error(err.error?.message || 'Server error. Please try again.');
        }
      }
    });

}

}
