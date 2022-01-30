import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTablesDialogComponent } from './join-tables-dialog.component';

describe('JoinTablesDialogComponent', () => {
  let component: JoinTablesDialogComponent;
  let fixture: ComponentFixture<JoinTablesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinTablesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinTablesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
