import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-icon',
  templateUrl: './nav-icon.component.html',
  styleUrls: ['./nav-icon.component.css'],
})
export class NavIconComponent implements OnInit {
  constructor(private router: Router) {}

  Navigate() {
    this.router.navigate(['/']);
  }
  ngOnInit(): void {}
}
