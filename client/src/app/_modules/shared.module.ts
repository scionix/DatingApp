import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Toast, ToastrModule } from 'ngx-toastr';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { NgxSpinnerModule } from "ngx-spinner";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxGalleryModule,
    NgxSpinnerModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    })
  ],

  exports: [
    BsDropdownModule,
    NgxSpinnerModule,
    NgxGalleryModule,
    ToastrModule,
    TabsModule
  ]
})
export class SharedModule { }
