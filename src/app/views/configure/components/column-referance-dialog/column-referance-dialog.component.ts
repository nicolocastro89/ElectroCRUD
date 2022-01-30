import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { IViewColumn, IView } from '../../../../../shared/interfaces/views.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ViewsIPCService } from '../../../../services/ipc/views.ipc.service';
import { IPCListOfTables, IPCTableInfo } from '../../../../../shared/ipc/views.ipc';

@Component({
  selector: 'app-column-referance-dialog',
  templateUrl: './column-referance-dialog.component.html',
  styleUrls: ['./column-referance-dialog.component.scss']
})
export class ColumnReferanceDialogComponent implements OnInit {

  title: string = "Column Referance";

  isSaveEnabled: boolean = false;
  view: IView;
  viewColumn: IViewColumn;
  formGroup: FormGroup;
  tables: string[] = [];
  columns: IPCTableInfo.TableInfoColumn[] = [];

  constructor(
    public ref: NbDialogRef<any>,
    private fb: FormBuilder,
    private viewsIPCService: ViewsIPCService
  ) {

  }

  async ngOnInit() {
    if (this.ref.componentRef.instance.row) {
      this.viewColumn = { ...this.ref.componentRef.instance.row } as IViewColumn;
      this.view = { ...this.ref.componentRef.instance.view } as IView;
    } else {
      return;
    }

    console.log(this.viewColumn);

    if (!this.viewColumn.ref) {
      this.viewColumn.ref = [];
    }

    this.formGroup = this.fb.group({
      tableCtrl: ['', Validators.required],
      matchColumnCtrl: ['', Validators.required],
      nameCtrl: [[], Validators.required]
    });


    await this.loadTablesList();
    await this.loadTableColumns();



    this.formGroup.controls['tableCtrl'].valueChanges.subscribe((val) => {
      if (this.viewColumn.ref[0] && this.viewColumn.ref[0].table == val) {
        return;
      }
      this.viewColumn.ref = [{}]
      this.viewColumn.ref[0].table = val;
      this.viewColumn.ref[0].match_column = null;
      this.viewColumn.ref[0].name = null;
      this.loadTableColumns();
    })

    await new Promise(r => setTimeout(r, 500));

    let table, match_column = '';
    let names = [];
    if (this.viewColumn.ref.length > 0) {
      table = this.viewColumn.ref[0].table;
      match_column = this.viewColumn.ref[0].match_column
      names = this.viewColumn.ref.map(r => r.name)
    }

    this.formGroup.controls.tableCtrl.setValue(table);
    this.formGroup.controls.matchColumnCtrl.setValue(match_column);
    this.formGroup.controls.nameCtrl.setValue(names);

  }

  public async loadTablesList() {
    let res: IPCListOfTables.IResponse = await this.viewsIPCService.listOfTables();
    if (res.valid) {
      this.tables = [...res.tables].filter(tbl => tbl != this.view.table);
    }
  }

  public async loadTableColumns() {
    if (!this.viewColumn.ref[0] || !this.viewColumn.ref[0].table) {
      return;
    }
    let resColumns: IPCTableInfo.IResponse = await this.viewsIPCService.tableInfo(this.viewColumn.ref[0].table);

    this.columns = [...resColumns.columns];

    await new Promise(r => setTimeout(r, 500));
    this.formGroup.controls.matchColumnCtrl.setValue(this.viewColumn.ref[0].match_column);
    this.formGroup.controls.nameCtrl.setValue(this.viewColumn.ref.map(r => r.name));
  }

  save() {
    this.viewColumn.ref = this.formGroup.controls.nameCtrl.value.map(n => (
      {
        table: this.formGroup.controls.tableCtrl.value,
        match_column: this.formGroup.controls.matchColumnCtrl.value,
        name: n
      }
    ), this);
    this.ref.close(this.viewColumn.ref);
  }

}
