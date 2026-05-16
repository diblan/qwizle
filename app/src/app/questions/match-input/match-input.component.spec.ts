import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchInputComponent } from './match-input.component';

describe('MatchInputComponent', () => {
  let fixture: ComponentFixture<MatchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatchInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(MatchInputComponent);
    fixture.componentRef.setInput('question', {
      id: 1,
      type: 'MATCH',
      prompt: { text: 'Match ports.', media: [] },
      interaction: {
        kind: 'MATCHING',
        leftItems: [
          { id: 'http', content: { kind: 'TEXT', text: 'HTTP' } },
          { id: 'https', content: { kind: 'TEXT', text: 'HTTPS' } },
        ],
        rightItems: [
          { id: '80', content: { kind: 'TEXT', text: '80' } },
          { id: '443', content: { kind: 'TEXT', text: '443' } },
        ],
      },
      tags: [],
      createdByUserId: 1,
      createdAt: '2026-05-16T00:00:00Z',
    });
    fixture.detectChanges();
  });

  it('emits stable item ids for completed matches', () => {
    const component = fixture.componentInstance;
    spyOn(component.submissionChange, 'emit');

    component.selections = { http: '80', https: '443' };
    component.update();

    expect(component.submissionChange.emit).toHaveBeenCalledWith({
      type: 'MATCH',
      response: { pairs: [{ leftId: 'http', rightId: '80' }, { leftId: 'https', rightId: '443' }] },
    });
  });
});
