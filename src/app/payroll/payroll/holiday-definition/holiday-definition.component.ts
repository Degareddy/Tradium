import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserData } from '../payroll.module';
import { AppHelpComponent } from 'src/app/layouts/app-help/app-help.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-holiday-definition',
  templateUrl: './holiday-definition.component.html',
  styleUrls: ['./holiday-definition.component.css']
})
export class HolidayDefinitionComponent implements OnInit {
  phtDetForm!: FormGroup
  modes!: any[];
   @Input() max: any;
  tomorrow = new Date();
  bonusCode!: any;
  modeIndex!: number;
  textMessageClass!: string;
  retMessage!: string;
  tranStatus!: string;
  YearNo: any = [];
  userData!:any;

  constructor(private fb: FormBuilder, public dialog:MatDialog ) {
    this.phtDetForm = this.formInit();
  }
  formInit() {
    return this.fb.group({
      company: ['', [Validators.required, Validators.maxLength(10)]],
      location: ['', [Validators.required, Validators.maxLength(10)]],
      holidayCode: ['', [Validators.required, Validators.maxLength(10)]],
      holidayDesc: ['', [Validators.required, Validators.maxLength(50)]],
      holidayType: ['', [Validators.required, Validators.maxLength(10)]],
      tranDate: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      daysCount: ['', [Validators.required]],
      repeats: [''],
      typeStatus: ['', [Validators.required, Validators.maxLength(10)]],
      notes: ['', [Validators.required, Validators.maxLength(512)]],
      mode: ['view']
    })
  }
  ngOnInit(): void {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData) as UserData;
      // //console.log(this.userData);
    }
  }
  onUpdate() {

  }
  insert() {

  }
  reset() {
    this.phtDetForm.reset();

  }
  onHelpCilcked(){
    const dialogRef: MatDialogRef<AppHelpComponent> = this.dialog.open(AppHelpComponent, {

      disableClose: true,
      data: {
        ScrId: "SM303",
        Page: "Products",
        SlNo: 38,
        User: this.userData.userID,
        RefNo: this.userData.sessionID
      }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
