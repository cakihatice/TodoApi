import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoDialog } from './todo-dialog';

describe('TodoDialog', () => {
  let component: TodoDialog;
  let fixture: ComponentFixture<TodoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
