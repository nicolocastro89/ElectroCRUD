import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewsRoutingModule } from './views-routing.module';
import { ViewComponent } from './view/view.component';
import { ConfigureComponent } from './configure/configure.component';
import { EmptyComponent } from './empty/empty.component';
import {
  NbAccordionModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbButtonModule,
  NbTooltipModule,
  NbSelectModule,
  NbCheckboxModule,
  NbAlertModule,
  NbActionsModule,
  NbSpinnerModule,
  NbContextMenuModule,
  NbDatepickerModule,
  NbBadgeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbMenuModule,
  NbTabsetModule,
  NbAutocompleteModule,
  NbAccordionComponent
} from '@nebular/theme';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ViewEditComponent } from './view/edit/edit.component';
import { ViewAddComponent } from './view/add/add.component';
import { ViewViewComponent } from './view/view/view.component';
import { RowFormComponent } from './view/components/row-form/row-form.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyFieldNbInputComponent } from './view/components/row-form/custom-types/formly-field-nb-input/formly-field-nb-input.component';
import { FormlyFieldNbSelectComponent } from './view/components/row-form/custom-types/formly-field-nb-select/formly-field-nb-select.component';
import { FormlyFieldNbChechboxComponent } from './view/components/row-form/custom-types/formly-field-nb-chechbox/formly-field-nb-chechbox.component';
import { FormlyFieldNbDatepickerComponent } from './view/components/row-form/custom-types/formly-field-nb-datepicker/formly-field-nb-datepicker.component';
import { FormlyFieldNbTextareaComponent } from './view/components/row-form/custom-types/formly-field-nb-textarea/formly-field-nb-textarea.component';
import { NgxMaskModule } from 'ngx-mask';
import { WidgetsComponent } from './view/view/components/widgets/widgets.component';
import { BreadcrumbsService } from '../services/breadcrumbs.service';
import { FiltersComponent } from './view/view/components/filters/filters.component';
import { AngularFittextModule } from 'angular-fittext';
import { SubViewComponent } from './view/view/components/sub-view/sub-view.component';
import { TagInputModule } from 'ngx-chips';
import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { QueryComponent } from './query/query.component';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { FormlyFieldNbFilepickerComponent } from './view/components/row-form/custom-types/formly-field-nb-filepicker/formly-field-nb-filepicker.component';
import { JoinTablesDialogComponent } from './configure/components/join-tables-dialog/join-tables-dialog.component';
import { QueryBuilderModule } from 'angular2-query-builder';
@NgModule({
  /*schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],*/
  declarations: [ViewComponent, ConfigureComponent, EmptyComponent, ViewEditComponent, ViewAddComponent, WidgetsComponent, ViewViewComponent, RowFormComponent, FormlyFieldNbInputComponent, FormlyFieldNbSelectComponent, FormlyFieldNbChechboxComponent, FormlyFieldNbDatepickerComponent, FormlyFieldNbTextareaComponent, FiltersComponent, SubViewComponent, QueryComponent, FormlyFieldNbFilepickerComponent, JoinTablesDialogComponent],
  providers: [BreadcrumbsService],
  imports: [
    CommonModule,
    ViewsRoutingModule,
    NbAccordionModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    NbTooltipModule,
    NbSelectModule,
    NbCheckboxModule,
    NbAlertModule,
    NbActionsModule,
    NbSpinnerModule,
    FormsModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    NbContextMenuModule,
    NbBadgeModule,
    NgxMaskModule.forChild(),
    NbDatepickerModule,
    NbTabsetModule,
    NbAutocompleteModule,
    NbBadgeModule,
    NgSelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'nb-input',
          component: FormlyFieldNbInputComponent
        },
        {
          name: 'nb-datepicker',
          component: FormlyFieldNbDatepickerComponent
        },
        {
          name: 'nb-textarea',
          component: FormlyFieldNbTextareaComponent
        },
        {
          name: 'nb-checkbox',
          component: FormlyFieldNbChechboxComponent
        },
        {
          name: 'nb-filepicker',
          component: FormlyFieldNbFilepickerComponent
        }
      ]
    }),
    NbLayoutModule,
    NbSidebarModule,
    NbMenuModule,
    AngularFittextModule,
    TagInputModule,
    NgBootstrapFormValidationModule,
    MonacoEditorModule,
    QueryBuilderModule,
  ],
  entryComponents: [ViewComponent, ConfigureComponent, EmptyComponent, ViewEditComponent, ViewAddComponent, ViewViewComponent, WidgetsComponent, SubViewComponent, QueryComponent]
})
export class ViewsModule { }
