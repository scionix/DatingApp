import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  //cancel event to send out indicating we want to close the register form
  @Output() cancelRegister = new EventEmitter();

  //holds our user
  model: any = {};


  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  //register user with accountService
  register() {
    this.accountService.register(this.model).subscribe(response => {
      console.log(response);
      this.cancel();
    }, error => {
        //error is the whole http response, error.error is the actual error message
        console.log(error);
        this.toastr.error(error.error);
    });
  }

  //closes the register form when we successfully register
  cancel() {
    this.cancelRegister.emit(false);
  }

}
