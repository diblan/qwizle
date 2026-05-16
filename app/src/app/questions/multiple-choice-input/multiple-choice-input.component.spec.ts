import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceInputComponent } from './multiple-choice-input.component';

describe('MultipleChoiceInputComponent', () => {
  let fixture: ComponentFixture<MultipleChoiceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MultipleChoiceInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(MultipleChoiceInputComponent);
    fixture.componentRef.setInput('question', {
      id: 1,
      type: 'MULTIPLE_CHOICE',
      prompt: { text: 'Pick protocols.', media: [] },
      interaction: {
        kind: 'OPTION_SELECTION',
        selectionMode: 'MULTIPLE',
        options: [
          { id: 'tcp', content: { kind: 'TEXT', text: 'TCP' } },
          { id: 'udp', content: { kind: 'TEXT', text: 'UDP' } },
        ],
      },
      tags: [],
      createdByUserId: 1,
      createdAt: '2026-05-16T00:00:00Z',
    });
    fixture.detectChanges();
  });

  it('emits selected option ids', () => {
    const component = fixture.componentInstance;
    spyOn(component.submissionChange, 'emit');

    component.toggleMultiple('tcp', true);

    expect(component.submissionChange.emit).toHaveBeenCalledWith({ type: 'MULTIPLE_CHOICE', response: { selectedOptionIds: ['tcp'] } });
  });
});
