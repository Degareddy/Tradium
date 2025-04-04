import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ColumnApi, GridApi, GridOptions } from 'ag-grid-community';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MastersService } from 'src/app/Services/masters.service';
import { ProjectsService } from 'src/app/Services/projects.service';
import { SubSink } from 'subsink';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'src/app/general/confirm-dialog/confirm-dialog.component';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { serviceClass } from '../../Project.class';
import { UserDataService } from 'src/app/Services/user-data.service';
import { SaveApiResponse } from 'src/app/general/Interface/admin/admin';
import { displayMsg, Items, Mode, TextClr, TranType } from 'src/app/utils/enums';
import { AccessSettings } from 'src/app/utils/access';

@Component({
  selector: 'app-service-numbers',
  templateUrl: './service-numbers.component.html',
  styleUrls: ['./service-numbers.component.css']
})

export class ServiceNumbersComponent implements OnInit, OnDestroy {
  serviceForm!: FormGroup;
  retMessage: string = '';
  textMessageClass: string = '';
  private columnApi!: ColumnApi;
  private gridApi!: GridApi;
  public gridOptions!: GridOptions;
  pageSizes: number[] = [25, 50, 100, 250, 500];
  pageSize: number = 25;
  today = new Date();
  private subSink: SubSink = new SubSink();
  private serviceCls: serviceClass = new serviceClass();
  rowData: any[] = [];
  srNum: number = 0;
  columnDefs: any[] = [
    { field: "slNo", headerName: "S.No", width: 80, resizable: true },
    { field: "serviceTypeDesc", headerName: "Service", sortable: true, filter: true, resizable: true, flex: 1 },
    { field: "serviceType", headerName: "Service", sortable: true, filter: true, resizable: true, flex: 1, hide: true },
    { field: "serviceNo", headerName: "Service No", sortable: true, filter: true, resizable: true, flex: 1 },
    { field: "deviceNo", headerName: "Device No", sortable: true, filter: true, resizable: true, flex: 1 },
    { field: "serviceStatus", headerName: "Status", sortable: true, filter: true, resizable: true, flex: 1 },
    { field: "notes", headerName: "Notes", sortable: true, filter: true, resizable: true, flex: 1, hide: true },
    {
      field: "deviceDate", headerName: "Recorded Date", sortable: true, filter: true, resizable: true, flex: 1, valueFormatter: function (params: any) {
        if (params.value) {
          const date = new Date(params.value);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
        return null;
      },
    },
  ];
  public rowSelection: 'single' | 'multiple' = 'multiple';
  onRowClick: any;
  serData: any;
  returnMsg: string = '';

  constructor(
    protected router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog, private userDataService: UserDataService,
    private masterService: MastersService,
    private projService: ProjectsService,
    private loader: NgxUiLoaderService,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string, Trantype: string, Property: string, Block: string, Flat: string, type: string, status: string }
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  initForm() {
    this.serviceForm = this.fb.group({
      serviceType: ['', Validators.required],
      serviceNo: ['', Validators.required],
      deviceNo: [''],
      serviceStatus: [{ value: '', disabled: true }],
      notes: [''],
      deviceDate: [new Date(), [Validators.required]]
    });
  }

  addNew() {
    this.srNum = 0;
    this.initForm();
    this.clearMsg();
  }

  add() {
    this.Clear();
  }

  Delete() {
    const message = `Are you sure you want to do this?`;
    const dialogData = new ConfirmDialogModel("Confirm Delete?", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      height: '200px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.onSubmit();
      }
    });
  }

  onPageSizeChanged() {
    if (this.gridApi) {
      this.gridApi.paginationSetPageSize(this.pageSize);
    }
  }

  clearMsg() {
    this.displayMessage("", "");
  }

  private displayMessage(message: string, cssClass: string) {
    this.retMessage = message;
    this.textMessageClass = cssClass;
  }
  commonParams() {
    return {
      company: this.userDataService.userData.company,
      location: this.userDataService.userData.location,
      user: this.userDataService.userData.userID,
      refNo: this.userDataService.userData.sessionID
    }
  }
  loadData() {
    const serbody = {
      ...this.commonParams(),
      item: Items.SERNUMBER,
      mode: this.data.mode
    };
    const Sbody$ = this.masterService.GetMasterItemsList(serbody);
    this.subSink.sink = forkJoin([Sbody$]).subscribe(
      ([serRes]: any) => {
        this.serData = serRes['data'];
      },
      error => {
        this.handleError(error.message);
      }
    );
    this.getServiceData(this.data.Flat, false);
  }

  getServiceData(flat: string, loadFlag: boolean) {
    const body = {
      ...this.commonParams(),
      PropCode: this.data.Property,
      BlockCode: this.data.Block,
      UnitCode: flat,
      ItemType: TranType.SERVICE
    }
    try {
      this.subSink.sink = this.projService.GetUnitServiceDetails(body).subscribe((res: any) => {
        if (res.status.toUpperCase() === AccessSettings.SUCCESS) {
          this.rowData = res['data'];
          if (loadFlag && this.data.mode.toUpperCase() != Mode.Delete && this.srNum === 0) {
            const maxSlNo = this.rowData.reduce((maxSlNo: any, currentItem: any) => {
              return Math.max(maxSlNo, currentItem.slNo);
            }, 0);
            this.srNum = maxSlNo;
          }
          else if (loadFlag && this.data.mode.toUpperCase() === Mode.Delete && this.srNum != 0) {
            this.srNum = 0;
            this.initForm();
            this.displayMessage(displayMsg.SUCCESS + this.returnMsg, TextClr.green);
          }
        }
        else {
          if (this.data.mode.toUpperCase() === Mode.Delete) {
            this.srNum = 0;
            this.initForm();
            this.rowData = [];
            this.displayMessage(displayMsg.SUCCESS + this.returnMsg, TextClr.green);
          } else {
            this.handleError(res.message);
          }
        }
      });
    }
    catch (ex: any) {
      this.handleError(ex.message);
    }
  }
  onDeviceDateChange(event: any): void {
    const selectedDate = new Date(event.value);
    const adjustedDate = new Date(
      selectedDate.getTime() + Math.abs(selectedDate.getTimezoneOffset() * 60000)
    );
    this.serviceForm.get('deviceDate')?.setValue(adjustedDate);
  }
  serviceTypeChnage() {
    this.serviceForm.get('serviceNo')?.patchValue('');
    this.serviceForm.get('deviceNo')?.patchValue('');
    this.serviceForm.get('deviceDate')?.patchValue(new Date());
    this.serviceForm.get('serviceStatus')?.patchValue('');
    this.serviceForm.get('notes')?.patchValue('');
  }

  prepareServiceCls() {
    const formValues = this.serviceForm.value;
    this.serviceCls.blockCode = this.data.Block;
    this.serviceCls.company = this.userDataService.userData.company;
    this.serviceCls.location = this.userDataService.userData.location;
    this.serviceCls.user = this.userDataService.userData.userID;
    this.serviceCls.notes = formValues.notes;
    this.serviceCls.propCode = this.data.Property;
    this.serviceCls.serviceNo = formValues.serviceNo;
    this.serviceCls.deviceNo = formValues.deviceNo;
    this.serviceCls.serviceType = formValues.serviceType;
    this.serviceCls.slNo = this.srNum;
    this.serviceCls.unitCode = this.data.Flat;
    this.serviceCls.mode = this.data.mode;
    this.serviceCls.refNo = this.userDataService.userData.sessionID;
    this.serviceCls.devicedate = this.serviceForm.get('deviceDate')?.value
  }
  onSubmit() {
    if (this.serviceForm.invalid) {
      return;
    } else {
      try {
        this.prepareServiceCls();
        this.loader.start();
        this.subSink.sink = this.projService.UpdateUnitServices(this.serviceCls).subscribe((res: SaveApiResponse) => {
          this.loader.stop();
          if (res.status.toUpperCase() === AccessSettings.SUCCESS) {
            if (this.data.mode.toUpperCase() === Mode.Delete) {
              this.getServiceData(this.data.Flat, true);
              this.returnMsg = res.message;
              this.displayMessage(displayMsg.SUCCESS + res.message, TextClr.green);
            }
            else {
              this.getServiceData(res.tranNoNew, true);
              this.displayMessage(displayMsg.SUCCESS + res.message, TextClr.green);
            }
          }
          else {
            this.handleError(res.message);
          }
        });
      }
      catch (ex: any) {
        this.handleError(ex.message);
      }
    }
  }

  Clear() {
    this.initForm();
    this.srNum = 0;
    this.clearMsg();
  }

  onDelete() {
    const message = `Are you sure you want to do this?`;
    const dialogData = new ConfirmDialogModel("Confirm Delete?", message);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      height: '200px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.onSubmit();
      }
    });
  }

  onRowSelected(event: any) {
    this.srNum = event.data.slNo;
    this.serviceForm.patchValue({
      serviceType: event.data.serviceType,
      serviceNo: event.data.serviceNo,
      deviceNo: event.data.deviceNo,
      serviceStatus: event.data.serviceStatus,
      notes: event.data.notes,
      deviceDate: event.data.deviceDate
    }, { emitEvent: false });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    const gridApi = params.api;
    gridApi.addEventListener('rowClicked', this.onRowSelected.bind(this));
  }

  private handleError(errorMessage: string) {
    this.retMessage = errorMessage;
    this.textMessageClass = "red";
  }
}
