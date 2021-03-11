import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  //'model' is going to contain username and password
  model: any = {}
  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  //log the user in with accountService
  login() {
    this.accountService.login(this.model).subscribe(response => {
      this.router.navigateByUrl('/members');
    }, error => {
        //error is the whole http response, error.error is the actual error message
        console.log(error);
        this.toastr.error(error.error);
    });
  }

  //log the user out with accountService
  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }

}
