import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IView } from '../../../../shared/interfaces/views.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { ViewsService } from '../../../services/store/views.service';
import { ViewsIPCService } from '../../../services/ipc/views.ipc.service';
import { NgModel } from '@angular/forms';
import { NbMenuService, NbDialogService, NbToastrService } from '@nebular/theme';
import { Observable, of, Subscription } from 'rxjs';
import { ConfirmDeleteComponent } from '../../../components/dialogs/confirm-delete/confirm-delete.component';
import {
  IPCDeleteData,
  IPCReadData,
} from '../../../../shared/ipc/views.ipc';

import { BreadcrumbsService } from '../../../services/breadcrumbs.service';
import { IViewFilter } from '../../../../shared/interfaces/filters.interface';
import { timer } from 'rxjs';
import { WidgetsComponent } from './components/widgets/widgets.component'
import { filter, reduce } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewViewComponent implements OnInit, OnDestroy {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableContextMenuTmpl', { static: true }) tableContextMenuTmpl: TemplateRef<any>;
  @ViewChild('subviewTableIconTmpl', { static: true }) subviewTableIconTmpl: TemplateRef<any>;
  @ViewChild(WidgetsComponent) widgets: WidgetsComponent;

  view: IView;
  isLoading: boolean = false;
  title: string;

  rows = [];
  columns = [];

  totalElements: number = 0;
  offset: number = 0;
  limit: number = 10;

  searchInputModel: NgModel;
  showSearchClear: boolean = false;

  menuItems: any = []

  menuServiceObserver: Subscription;
  routeObserver: Subscription;

  selectedFilter: IViewFilter;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionsService: SessionService,
    private viewsService: ViewsService,
    private viewsIPCService: ViewsIPCService,
    private menuService: NbMenuService,
    private dialogService: NbDialogService,
    private toastService: NbToastrService,
    private breadcrumbsService: BreadcrumbsService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngAfterViewChecked() {

  }

  async ngOnInit() {
    this.routeObserver = this.route.parent.params.subscribe((params) => {
      console.log("params", params);
      this.loadView();
    });

    this.menuServiceObserver = this.menuService.onItemClick().subscribe(item => {
      if (item.tag != "rowMenu") {
        return;
      }
      switch (item.item.title) {
        case 'Edit':
          this.editRow(item.item.data)
          break;
        case 'Delete':
          this.deleteRow(item.item.data);
          break;
      }
    });
  }


  ngOnDestroy() {
    this.menuServiceObserver.unsubscribe();
    this.routeObserver.unsubscribe();
    this.breadcrumbsService.removeChildByURL(`/views/${this.view.id}/view/view`);
  }

  onFilterSelected(event: IViewFilter) {
    // set selected filter
    this.selectedFilter = event;
    // reload the data
    this.selectLimit(this.limit);
  }

  onFilterDeselected() {
    // remove any selected filter
    this.selectedFilter = null;
    // reload the data
    this.selectLimit(this.limit);
  }

  deleteView(): void {
    this.dialogService
      .open(ConfirmDeleteComponent, { hasBackdrop: true })
      .onClose
      .subscribe(async (res) => {
        if (res) {
          this.viewsService.delete(this.view.id);
          //this.sessionsService.reloadViews();
          this.viewsService.triggerChanges();
          this.router.navigate(['/accounts']);
        }
      });
  }

  editRow(row): void {
    let pk: string = this.primaryKeyColumn;
    if (!pk) {
      // toast no OK
      return;
    }
    let pkValue = row[pk];
    this.router.navigate(['/views', this.view.id, 'view', 'edit', pk, pkValue])
  }

  deleteRow(row): void {
    let pk: string = this.primaryKeyColumn;
    if (!pk) {
      // toast no OK
      return;
    }
    let pkValue = row[pk];

    this.dialogService
      .open(ConfirmDeleteComponent, { hasBackdrop: true })
      .onClose
      .subscribe(async (res) => {
        if (res) {
          const delRes: IPCDeleteData.IResponse = await this.viewsIPCService.deleteData(
            this.view.table,
            [
              {
                column: pk,
                opr: IPCDeleteData.IIPCDeleteDataWhereOpr.EQ,
                value: pkValue,
                or: false
              }
            ]
          );

          if (delRes.error) {
            this.toastService.danger(res.error, 'Error');
            return false;
          } else {
            if (delRes.valid) {
              this.toastService.success('Update completed successfully ', 'Success');
            }
          }
          this.selectLimit(this.limit)
        }
      });
  }

  clearSearch(): void {
    // reset search box input
    this.searchInputModel = '' as any;

    this.showSearchClear = false;

    // fast way to reload results
    this.selectLimit(this.limit);
  }

  selectLimit(value): void {
    this.limit = Number(value);
    this.offset = 0;
    this.setPage({
      offset: this.offset,
      limit: this.limit,
      pageSize: this.limit
    })
  }

  get primaryKeyColumn(): string {
    let pri: string = null;
    this.view.columns.forEach(col => {
      if (col.key == "PRI" || col.key == "1") {
        pri = col.name;
      }
    })
    return pri;
  }

  async loadView() {
    if (this.route.parent.snapshot.paramMap.has('id')) {
      // has id, we are in edit mode
      this.view = this.viewsService.get(
        Number(this.route.parent.snapshot.paramMap.get('id'))
      );
      //this.title = this.view.name;
    }
    this.menuItems = [
      {
        title: 'Edit',
        icon: 'edit-2',
        hidden: !this.view.permissions.update
      },
      {
        title: 'Delete',
        icon: 'trash-2',
        hidden: !this.view.permissions.delete
      }
    ]
    this.breadcrumbsService.addChild('View', `/views/${this.view.id}/view/view`);

    await this.reload();
  }

  private getViewJoints(): IPCReadData.IIPCReadDataJoin[] {
    let joins = []
    // this.view
    //   .columns
    //   .filter(col => col.ref && col.ref.length > 0)
    //   .flatMap(col =>
    //     col.ref.map(r => (
    //       {
    //         table: r.table,
    //         on: {
    //           condition: 'and',
    //           rules: [
    //             {
    //               field: col.name,
    //               value: r.match_column,
    //               operator: IPCReadData.IIPCReadDataWhereOpr.EQ
    //             } as IPCReadData.IIPCRule
    //           ]
    //         } as IPCReadData.IIPCRuleSet,
    //         columns: [r.name]
    //       } as IPCReadData.IIPCReadDataJoin
    //     )));

    joins.push(...this.view.joins.map(j => ({
      table: j.table,
      alias: j.alias,
      on: j.rules as IPCReadData.IIPCRuleSet,
      columns: j.columns.map(c => c.name)
    } as IPCReadData.IIPCReadDataJoin)
    ));
    joins = [... new Set(joins.map(j => JSON.stringify(j)))].map(j => JSON.parse(j) as IPCReadData.IIPCReadDataJoin);
    return joins
  }

  checkValidBase64(str: string) {
    if (str === '') { return false; }
    try {
      return btoa(atob(str.split('base64,')[1])) == str.split('base64,')[1];
    } catch (err) {
      return false;
    }
  }

  async reload() {
    this.isLoading = true;
    let data = await this.viewsIPCService
      .readData(
        this.view.table,
        this.view.columns.filter(col => col.enabled).map(col => col.name),
        this.limit,
        this.offset,
        null,
        null,
        [],
        this.getViewJoints()
      );
    this.totalElements = data.count;
    let columns = data.data.length > 0 ? this.view.columns
      .filter(col => col.visible)
      .map(col => ({ name: col.alias || col.name, prop: col.name })) :
      [];
    columns.push(...this.view.joins.flatMap(j => {
      return j.columns.filter(col => col.visible).map(col => ({ name: col.alias || col.name, prop: `${j.alias}_${col.name}` }));
    }));
    console.log("columns", columns)
    let subviewActionColumn = this.view.subview && this.view.subview.enabled ? [{ cellTemplate: this.subviewTableIconTmpl, frozenLeft: true, maxWidth: 50, resizeable: false, sortable: false }] : [];
    this.columns = [
      ...subviewActionColumn,
      ...columns,
      { cellTemplate: this.tableContextMenuTmpl, frozenRight: true, maxWidth: 50, resizeable: false, sortable: false }
    ];
    this.rows = [...data.data];

    this.rows.map(row => {

      Object.keys(row).forEach(key => {
        if (this.checkValidBase64(row[key])) {
          row[key] = this.sanitizer.bypassSecurityTrustHtml(`<a href="${row[key]}" download>Download file</a>`);;
        }
      });

      return row;
    });

    console.log("rows", this.rows)
    console.log(data);
    timer(2000).subscribe(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
    console.log("this.widgets", this.widgets)
    this.widgets.reloadData();
  }

  async setPage(pageInfo) {
    this.isLoading = true;
    console.log("pageInfo:", pageInfo);
    this.offset = pageInfo.offset;
    let sqlOffset = this.offset * pageInfo.pageSize;
    let data = await this.viewsIPCService
      .readData(
        this.view.table,
        this.view.columns.map(col => col.name),
        this.limit,
        sqlOffset,
        this.view.columns.filter(col => col.searchable).map(col => col.name),
        (this.searchInputModel && String(this.searchInputModel).length > 1) ? String(this.searchInputModel) : null,
        this.selectedFilter ? this.selectedFilter.where as IPCReadData.IIPCReadDataWhere[] : null,
        this.getViewJoints()
      );
    this.rows = [...data.data];
    this.totalElements = data.count;

    timer(1000).subscribe(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  doSearch(event): void {
    this.showSearchClear = String(this.searchInputModel).length > 1;

    // if no search input, the user clear the text, reload the result to reset
    if (String(this.searchInputModel).length == 0) return this.selectLimit(this.limit)

    // validate min. of 2 chars
    if (String(this.searchInputModel).length < 2) return;

    // fast way to reload the table
    this.selectLimit(this.limit);
  }

  setContextItems(row): void {
    this.menuItems = [...this.menuItems].map(mItem => {
      mItem.data = row;
      return mItem
    });
    console.log(this.menuItems)
  }

  subviewTableAction(row): void {
    console.log("click", row);
    this.table.rowDetail.toggleExpandRow(row);

  }

  onSubviewToggle(event): void {
    console.log("onSubviewToggle", event);
  }

}
