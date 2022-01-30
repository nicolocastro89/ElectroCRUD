import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { IViewColumn, IView, IViewColumnReferance, IJoinTables } from '../../../../../shared/interfaces/views.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ViewsIPCService } from '../../../../services/ipc/views.ipc.service';
import { IPCListOfTables, IPCTableInfo } from '../../../../../shared/ipc/views.ipc';
import { QueryBuilderConfig, Option, RuleSet } from 'angular2-query-builder';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { removeSummaryDuplicates } from '@angular/compiler';

@Component({
  selector: 'app-join-tables-dialog',
  templateUrl: './join-tables-dialog.component.html',
  styleUrls: ['./join-tables-dialog.component.scss']
})
export class JoinTablesDialogComponent implements OnInit {

  title: string = "Join Tables";

  view: IView;
  viewColumns: Array<{ column: IViewColumn, table: string }> = [];

  isSaveEnabled: boolean = false;
  formGroup: FormGroup;
  tables: string[] = [];
  joinTable: string;
  joinColumns: IPCTableInfo.TableInfoColumn[] = [];

  //filteredOptions$: Observable<Option[]>;

  joinRuleSetConfig: QueryBuilderConfig = {
    fields: {}
  };
  joinRules = {
    condition: 'and',
    rules: []
  };

  join?: IJoinTables;

  constructor(
    public ref: NbDialogRef<any>,
    private fb: FormBuilder,
    private viewsIPCService: ViewsIPCService
  ) {
    //this.onSelectionChange('');
    this.formGroup = this.fb.group({
      tableCtrl: ['', Validators.required],
      aliasCtrl: ['', Validators.required],
      selectCtrl: [[], Validators.required]
    });

    // this.joinRuleSetConfig.addRule = (parent?: RuleSet) => {
    //   console.log('Got here')
    //   const field = this.fields[0];
    //   parent.rules = parent.rules.concat([{
    //     field: field.value,
    //     operator: this.getDefaultOperator(field),
    //     value: this.getDefaultValue(field.defaultValue),
    //     entity: field.entity
    //   }]);
    // }
  }

  async ngOnInit() {

    this.view = { ...this.ref.componentRef.instance.view } as IView;
    if (this.ref.componentRef.instance.join) {
      this.join = { ...this.ref.componentRef.instance.join } as IJoinTables;
    }


    this.viewColumns = [...this.view.columns.map(c => ({ column: c, table: this.view.table }))];
    if (this.view.joins) {
      this.viewColumns.push(...this.view.joins.flatMap(j => {
        let table = j.table;
        if (j.alias) {
          table = j.alias;
        }
        return j.columns.map(c => ({ column: c, table: table }));
      }));
    }


    await this.loadTablesList();
    await this.loadTableColumns();
    await this.generateRuleSetConfig();

    this.formGroup.controls['tableCtrl'].valueChanges.subscribe((val) => {
      if (this.joinTable == val) {
        return;
      }

      this.joinTable = val;
      if (!this.formGroup.controls['aliasCtrl'].value) {
        let numberOfJoins = 0;

        if (this.view.joins) {
          numberOfJoins = this.view.joins.filter(j => j.table === val).length;
        }
        let alias = val;
        if (numberOfJoins > 0) {
          alias += numberOfJoins + 1
        }
        this.formGroup.controls['aliasCtrl'].setValue(alias)
      }
      this.formGroup.controls['selectCtrl'].setValue([]);
      this.joinRules = {
        condition: 'and',
        rules: []
      };
      this.loadTableColumns().then(r => this.generateRuleSetConfig());
    })

    let table, alias = '';
    let columns = []
    if (this.join) {
      table = this.join.table;
      alias = this.join.alias;
      columns = [...this.join.columns];

      this.joinRules = {
        condition: 'and',
        rules: [],
        ...this.join.rules
      }
    }

    this.formGroup.controls.tableCtrl.setValue(table);
    this.formGroup.controls.aliasCtrl.setValue(alias);
    this.formGroup.controls.selectCtrl.setValue(columns);


  }

  public async loadTablesList() {
    let res: IPCListOfTables.IResponse = await this.viewsIPCService.listOfTables();
    if (res.valid) {
      this.tables = [...res.tables].filter(tbl => tbl != this.view.table);
    }
  }

  public async loadTableColumns() {
    if (!this.joinTable) {
      this.joinColumns = [];
      return;
    }

    let resColumns: IPCTableInfo.IResponse = await this.viewsIPCService.tableInfo(this.joinTable);

    this.joinColumns = [...resColumns.columns];

    await new Promise(r => setTimeout(r, 500));

  }

  public async generateRuleSetConfig() {
    let availableColumns = [];
    if (this.view.columns.length > 0) {
      availableColumns = [...this.view.columns.map(c => ({ name: c.name, value: c }))]
    }
    const fields = this.joinColumns.reduce((current, col) => {
      current[col.name] = {
        name: col.name,
        type: 'open-category',
        options: availableColumns,
        operators: ['<', '<=', '=', '>=', '>'],
        defaultValue: () => ({ compareValue: '', compareAgainst: '' })
      };
      return current;
    }, {});

    this.joinRuleSetConfig = {
      fields: fields

    } as QueryBuilderConfig;
  }



  private filter(value: string): Option[] {
    const filterValue = value.toLowerCase();

    return [...this.view.columns.map(c => ({ name: c.name, value: c } as Option))]
      .filter(option => option.name.toLowerCase().includes(filterValue));
  }

  // getFilteredOptions(value: string): Observable<Option[]> {
  //   return of(value).pipe(
  //     map(filterString => this.filter(filterString)),
  //   );
  // }



  // onSelectionChange($event) {
  //   this.filteredOptions$ = this.getFilteredOptions($event);
  // }

  validateAlias() {

  }

  onChangeComparisonMode($event, rule) {

    rule.value.compareValue = undefined;
    rule.value.compareAgainst = $event;
  }

  columnVisibleName(option: { column: IViewColumn, table: string }) {
    let prefix = '';
    if (option.table) {
      prefix = `${option.table}.`;
    }
    return `${prefix}${option.column.name}`;
  }

  save() {
    this.join = {
      table: this.joinTable,
      alias: this.formGroup.controls['aliasCtrl'].value,
      rules: this.joinRules,
      columns: this.formGroup.controls['selectCtrl'].value
    }

    this.ref.close(this.join);
  }

  compareSelected(column1, column2): boolean {
    return column1.name === column2.name;
  }
}

