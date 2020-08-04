import { Component, OnInit } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  active: any;

  constructor(public router: Router, public route: ActivatedRoute) {
    // this.route.data.subscribe(console.log);
    // console.log(this.router.url);
  }

  ngOnInit(): void {}
}
