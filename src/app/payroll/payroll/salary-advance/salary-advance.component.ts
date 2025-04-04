import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppHelpComponent } from 'src/app/layouts/app-help/app-help.component';
import { UserDataService } from 'src/app/Services/user-data.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-salary-advance',
  templateUrl: './salary-advance.component.html',
  styleUrls: ['./salary-advance.component.css']
})
export class SalaryAdvanceComponent implements OnInit, OnDestroy {
  saHdrForm!: FormGroup;
  modes!: any[];
  textMessageClass!: string;
  @Input() max: any;
  tomorrow = new Date();
  private subSink: SubSink = new SubSink();
  retMessage!: string; constructor(private FormBuilder: FormBuilder, private userDataService: UserDataService,
    public dialog: MatDialog) {
    this.saHdrForm = this.formInit()
  }
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
  formInit() {
    return this.FormBuilder.group({

      payrollYear: ['', [Validators.required, Validators.maxLength(10)]],
      payrollPeriod: ['', [Validators.required, Validators.maxLength(10)]],
      tranNo: [''],
      tranDate: [new Date(), [Validators.required]],
      notes: [''],
      mode: ['View']
    })
  }
  ngOnInit(): void {
    // const storedUserData = sessionStorage.getItem('userData');
    // if (storedUserData) {
    //   this.userData = JSON.parse(storedUserData) as UserData;
    //   // //console.log(this.userData);
    // }
  }
  onUpdate() {

  }

  onHelpCilcked() {
    const dialogRef: MatDialogRef<AppHelpComponent> = this.dialog.open(AppHelpComponent, {
      disableClose: true,
      data: {
        ScrId: "ST603",
        Page: "Salary Advance",
        SlNo: 66,
        User: this.userDataService.userData.userID,
        RefNo: this.userDataService.userData.sessionID
      }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }
  reset() {
    this.saHdrForm = this.formInit();
  }

}
