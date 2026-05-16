import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleAnswerInputComponent } from './single-answer-input.component';

describe('SingleAnswerInputComponent', () => {
  let fixture: ComponentFixture<SingleAnswerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SingleAnswerInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(SingleAnswerInputComponent);
    fixture.detectChanges();
  });

  it('emits trimmed text submissions', () => {
    const component = fixture.componentInstance;
    spyOn(component.submissionChange, 'emit');

    component.answer = '  Paris  ';
    component.update();

    expect(component.submissionChange.emit).toHaveBeenCalledWith({ type: 'SINGLE_ANSWER', response: { text: 'Paris' } });
  });
});
