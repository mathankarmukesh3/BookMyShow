import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.sass'
})
export class AdminLayout {}